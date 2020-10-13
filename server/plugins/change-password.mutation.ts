import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { v4 as uuidv4 } from "uuid";
import { cookieDefaults } from "../defaults";
import { createToken, hashPassword, verifyPassword } from "../services/auth";

const ChangePasswordMutationPlugin = makeExtendSchemaPlugin((build) => ({
  typeDefs: gql`
    input ChangePasswordInput {
      password: String!
      newPassword: String!
    }

    type ChangePasswordPayload {
      token: String
      query: Query
    }

    extend type Mutation {
      changePassword(input: ChangePasswordInput!): ChangePasswordPayload
    }
  `,

  resolvers: {
    Mutation: {
      changePassword: async (_query, args, context) => {
        const {
          input: { password, newPassword },
        } = args;
        const { getCookie, jwtClaims, pgClient, setCookie } = context;
        await pgClient.query("SAVEPOINT graphql_mutation");

        try {
          if (!jwtClaims || !getCookie("refresh_token")) {
            throw Error("Access denied.");
          }

          const {
            rows: [auth],
          } = await pgClient.query(
            "SELECT * FROM postgraphile_auth.authentication_details_by_id($1)",
            [jwtClaims.sub]
          );

          if (!auth) {
            throw Error("Access denied.");
          }

          if (!(await verifyPassword(password, auth.hash))) {
            throw Error("Incorrect user or password.");
          }

          const hash = Buffer.from(await hashPassword(newPassword)).toString(
            "base64"
          );
          const refreshToken = createToken(uuidv4(), "7d");
          await pgClient.query(
            "SELECT postgraphile_auth.change_password($1, $2, $3)",
            [hash, refreshToken, auth.id]
          );

          setCookie("refresh_token", refreshToken, cookieDefaults);

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

export default ChangePasswordMutationPlugin;
