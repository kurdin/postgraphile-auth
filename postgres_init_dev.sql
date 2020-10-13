CREATE ROLE owner_role LOGIN PASSWORD 'owner_role';
CREATE ROLE authenticated;
CREATE ROLE anonymous;
GRANT anonymous TO authenticated;
GRANT authenticated TO owner_role;
CREATE DATABASE postgraphile_auth OWNER = owner_role;
CREATE DATABASE postgraphile_auth_shadow OWNER = owner_role;
