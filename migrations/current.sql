DROP SCHEMA IF EXISTS protected CASCADE;

ALTER DEFAULT PRIVILEGES REVOKE ALL ON SEQUENCES FROM public;
ALTER DEFAULT PRIVILEGES REVOKE ALL ON FUNCTIONS FROM public;

REVOKE ALL ON SCHEMA public FROM public;
GRANT ALL ON SCHEMA public TO :DATABASE_OWNER_ROLE;

CREATE SCHEMA protected;
GRANT USAGE ON SCHEMA public, protected TO :DATABASE_AUTHENTICATED_ROLE;

DROP SCHEMA IF EXISTS postgraphile_auth CASCADE;
CREATE SCHEMA postgraphile_auth;
GRANT USAGE ON SCHEMA postgraphile_auth TO :DATABASE_AUTHENTICATED_ROLE, :DATABASE_ANONYMOUS_ROLE;

ALTER DEFAULT PRIVILEGES IN SCHEMA public, protected, postgraphile_auth GRANT USAGE, SELECT ON SEQUENCES TO :DATABASE_AUTHENTICATED_ROLE;
ALTER DEFAULT PRIVILEGES IN SCHEMA public, protected, postgraphile_auth GRANT EXECUTE ON FUNCTIONS TO :DATABASE_AUTHENTICATED_ROLE;

-- anon role needs to access auth functions, as counter-intuitive as this next statement might seem
ALTER DEFAULT PRIVILEGES IN SCHEMA postgraphile_auth GRANT EXECUTE ON FUNCTIONS TO :DATABASE_ANONYMOUS_ROLE;

CREATE OR REPLACE FUNCTION protected.current_user_id()
  RETURNS INTEGER
  AS $$

    SELECT NULLIF(current_setting('jwt.claims.sub', true), '')::integer;

  $$  LANGUAGE sql STABLE
      SECURITY DEFINER;

COMMENT ON FUNCTION protected.current_user_id IS 'Returns the subject claim from the JWT, which ought to be users.id.';

CREATE OR REPLACE FUNCTION public.on_update_timestamp()
   RETURNS TRIGGER
   AS $$
   BEGIN

     NEW.updated_at = NOW();
     RETURN NEW;

   END;
   $$  LANGUAGE plpgsql STABLE;

-- users

CREATE TABLE protected.users (
  id SERIAL PRIMARY KEY,
  email citext NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  metadata JSONB,
  reset_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE TRIGGER users_updated_at BEFORE UPDATE ON protected.users FOR EACH ROW EXECUTE PROCEDURE on_update_timestamp();
COMMENT ON TABLE protected.users IS 'A user.';
ALTER TABLE protected.users ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON protected.users TO :DATABASE_AUTHENTICATED_ROLE;
GRANT SELECT ON protected.users TO :DATABASE_ANONYMOUS_ROLE;
GRANT UPDATE(email, full_name, metadata) ON protected.users TO :DATABASE_AUTHENTICATED_ROLE;

-- auth

CREATE TABLE postgraphile_auth.auth (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES protected.users (id),
  hash TEXT NOT NULL,
  confirm_token TEXT,
  refresh_token TEXT NOT NULL,
  refresh_rotated_at TIMESTAMPTZ NOT NULL,
  reset_token TEXT,
  reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ
);
ALTER TABLE postgraphile_auth.auth ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION postgraphile_auth.send_confirm_email()
  RETURNS TRIGGER
  AS $$
  DECLARE user_email CITEXT;
  BEGIN

    SELECT email from protected.users INTO user_email WHERE id = NEW.user_id;
    PERFORM graphile_worker.add_job(
      'confirm_email',
      json_build_object(
        'confirmToken', NEW.confirm_token,
        'email', user_email
      )
    );
    RETURN NEW;

  END;
  $$  LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER auth_updated_at BEFORE UPDATE ON postgraphile_auth.auth FOR EACH ROW EXECUTE PROCEDURE on_update_timestamp();
CREATE TRIGGER send_confirm_email AFTER INSERT ON postgraphile_auth.auth FOR EACH ROW EXECUTE PROCEDURE postgraphile_auth.send_confirm_email();

-- RLS: users
CREATE POLICY view_users ON protected.users FOR SELECT USING (id = protected.current_user_id());
CREATE POLICY edit_users ON protected.users FOR UPDATE WITH CHECK (id = protected.current_user_id());

-- login
CREATE OR REPLACE FUNCTION postgraphile_auth.authentication_details(user_email TEXT)
  RETURNS TABLE (
    id INTEGER,
    hash TEXT,
    refresh_token TEXT,
    rotate_refresh BOOLEAN,
    email_confirmed BOOLEAN,
    reset_required BOOLEAN,
    user_id INTEGER
  )
  AS $$

    SELECT
        a.id,
        a.hash,
        a.refresh_token,
        a.refresh_rotated_at > CURRENT_TIMESTAMP - INTERVAL '7 days' AS rotate_refresh,
        a.confirm_token IS NULL AS email_confirmed,
        a.reset_token IS NOT NULL AS reset_required,
        a.user_id
      FROM postgraphile_auth.auth a
        JOIN protected.users u ON u.id = a.user_id
      WHERE u.email = user_email;

  $$  LANGUAGE sql STABLE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.authentication_details_by_id(uid INTEGER)
  RETURNS TABLE (
    id INTEGER,
    hash TEXT,
    refresh_token TEXT,
    rotate_refresh BOOLEAN,
    email_confirmed BOOLEAN,
    reset_required BOOLEAN,
    user_id INTEGER
  )
  AS $$

    SELECT
        id,
        hash,
        refresh_token,
        refresh_rotated_at > CURRENT_TIMESTAMP - INTERVAL '7 days' AS rotate_refresh,
        confirm_token IS NULL AS email_confirmed,
        reset_token IS NOT NULL AS reset_required,
        user_id
      FROM postgraphile_auth.auth
      WHERE user_id = uid;

  $$  LANGUAGE sql STABLE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.rotate_refresh_token(new_token TEXT, uid INTEGER)
  RETURNS void
  AS $$

    UPDATE postgraphile_auth.auth
      SET refresh_token = new_token, refresh_rotated_at = CURRENT_TIMESTAMP
      WHERE id = uid;

  $$  LANGUAGE sql VOLATILE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.check_refresh_token(token TEXT)
  RETURNS TABLE (
    email_confirmed BOOLEAN,
    reset_required BOOLEAN,
    user_id INTEGER
  )
  AS $$

    SELECT
        a.confirm_token IS NULL as email_confirmed,
        a.reset_token IS NOT NULL AS reset_required,
        a.user_id
      FROM postgraphile_auth.auth a
      WHERE a.refresh_token = token
        AND a.refresh_rotated_at > CURRENT_TIMESTAMP - INTERVAL '7 days';

  $$  LANGUAGE sql STABLE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.user_account_exists(user_email TEXT)
  RETURNS boolean
  AS $$

    SELECT EXISTS (SELECT FROM protected.users WHERE email = user_email);

  $$  LANGUAGE sql STABLE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.create_account(user_email TEXT, user_name TEXT, password_hash TEXT, confirm_url_token TEXT, refresh_token_uuid TEXT)
  RETURNS void
  AS $$
  DECLARE new_user_id INTEGER;
  BEGIN

    INSERT INTO protected.users (email, full_name)
      VALUES (user_email, user_name)
      RETURNING id
      INTO new_user_id;
    INSERT INTO postgraphile_auth.auth (
      user_id,
      hash,
      confirm_token,
      refresh_token,
      refresh_rotated_at
    ) VALUES (
      new_user_id,
      password_hash,
      confirm_url_token,
      refresh_token_uuid,
      CURRENT_TIMESTAMP
    );

  END;
  $$  LANGUAGE plpgsql VOLATILE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.confirm_email(token TEXT)
  RETURNS BOOLEAN
  AS $$
  BEGIN

    IF NOT EXISTS (
      SELECT FROM postgraphile_auth.auth WHERE confirm_token = token
    ) THEN
      RETURN false;
    END IF;

    UPDATE postgraphile_auth.auth
      SET confirm_token = NULL
      WHERE confirm_token = token;

    RETURN true;

  END;
  $$  LANGUAGE plpgsql VOLATILE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.reset_password(user_email citext, token TEXT)
  RETURNS VOID
  AS $$
  DECLARE account postgraphile_auth.auth;
  BEGIN

    SELECT a.*
      FROM postgraphile_auth.auth a
        JOIN protected.users u ON u.id = a.user_id
      WHERE u.email = user_email
      INTO account;
    IF account IS NULL THEN
      PERFORM graphile_worker.add_job(
        'reset_password',
        json_build_object(
          'email', user_email,
          'knownUser', FALSE
        )
      );
      RETURN;
    END IF;

    UPDATE postgraphile_auth.auth
      SET reset_token = token,
        reset_expires_at = CURRENT_TIMESTAMP + INTERVAL '15 minutes'
      WHERE id = account.id;
    PERFORM graphile_worker.add_job(
      'reset_password',
      json_build_object(
        'email', user_email,
        'knownUser', TRUE,
        'resetToken', token
      )
    );

  END;
  $$  LANGUAGE plpgsql VOLATILE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.reset_password_with_token(token TEXT, new_hash TEXT, new_refresh_token TEXT)
  RETURNS BOOLEAN
  AS $$
  DECLARE account postgraphile_auth.auth;
  BEGIN

    SELECT * FROM postgraphile_auth.auth
      WHERE reset_token = token
        AND reset_expires_at > CURRENT_TIMESTAMP
      INTO account;
    IF account IS NULL THEN
      RETURN FALSE;
    END IF;

    UPDATE postgraphile_auth.auth
      SET
        hash = new_hash,
        refresh_token = new_refresh_token,
        refresh_rotated_at = CURRENT_TIMESTAMP,
        reset_expires_at = NULL,
        reset_token = NULL
      WHERE id = account.id;

    RETURN TRUE;

  END;
  $$  LANGUAGE plpgsql VOLATILE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION postgraphile_auth.change_password(new_hash TEXT, new_refresh_token TEXT, authid INTEGER)
  RETURNS VOID
  AS $$

    UPDATE postgraphile_auth.auth
      SET hash = new_hash,
        refresh_token = new_refresh_token,
        refresh_rotated_at = CURRENT_TIMESTAMP

  $$  LANGUAGE sql VOLATILE
      SECURITY DEFINER;

CREATE OR REPLACE FUNCTION protected.current_user()
  RETURNS protected.users
  AS $$

    SELECT * FROM protected.users
      WHERE id = protected.current_user_id()

  $$  LANGUAGE sql STABLE;

COMMENT ON FUNCTION protected.current_user() IS 'Returns the user entity identified by the JWT sub.';

