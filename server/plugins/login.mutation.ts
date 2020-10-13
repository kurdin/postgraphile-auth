import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { v4 as uuidv4 } from "uuid";
import { cookieDefaults } from "../defaults";
import { createToken, verifyPassword } from "../services/auth";

const LoginMutationPlugin = makeExtendSchemaPlugin((build) => ({
  typeDefs: gql`
    input LoginInput {
      email: String!
      password: String!
    }

    type LoginPayload {
      token: String
      query: Query
    }

    extend type Mutation {
      login(input: LoginInput!): LoginPayload
    }
  `,

  resolvers: {
    Mutation: {
      login: async (_query, args, context) => {
        const { pgClient, setCookie } = context;
        await pgClient.query("SAVEPOINT graphql_mutation");

        try {
          const {
            rows: [auth],
          } = await pgClient.query(
            "SELECT * FROM postgraphile_auth.authentication_details($1)",
            [args.input.email]
          );
          if (!auth) {
            throw Error("Incorrect user or password.");
          }

          if (auth.reset_required) {
            throw Error("Password reset required.");
          }

          if (!(await verifyPassword(args.input.password, auth.hash))) {
            throw Error("Incorrect user or password.");
          }

          if (!auth.email_confirmed) {
            throw Error("Email has not been confirmed.");
          }

          let refreshToken = auth.refreshToken;

          if (auth.rotate_refresh) {
            const newToken = createToken(uuidv4(), "7d");
            await pgClient.query(
              "SELECT postgraphile_auth.rotate_refresh_token($1, $2)",
              [newToken, auth.id]
            );
            refreshToken = newToken;
          }

          setCookie("refresh_token", refreshToken, cookieDefaults);

          // TODO: potentially track last login, etc

          const token = createToken(auth.user_id);

          return {
            token,
            query: build.$$isQuery,
          };
        } catch (e) {
          await pgClient.query("ROLLBACK TO SAVEPOINT graphql_mutation");
          throw e;
        } finally {
          await pgClient.query("RELEASE SAVEPOINT graphql_mutation");
        }
      },
    },
  },
}));

export default LoginMutationPlugin;
