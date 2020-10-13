import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { v4 as uuidv4 } from "uuid";
import { createToken, hashPassword } from "../services/auth";

const ResetPasswordWithTokenMutationPlugin = makeExtendSchemaPlugin(
  (build) => ({
    typeDefs: gql`
      input ResetPasswordWithTokenInput {
        token: String!
        newPassword: String!
      }

      type ResetPasswordWithTokenPayload {
        success: Boolean
        query: Query
      }

      extend type Mutation {
        resetPasswordWithToken(
          input: ResetPasswordWithTokenInput!
        ): ResetPasswordWithTokenPayload
      }
    `,

    resolvers: {
      Mutation: {
        resetPasswordWithToken: async (_query, args, context) => {
          const {
            input: { newPassword, token },
          } = args;
          if (!token) {
            throw Error("Access denied.");
          }
          if (!newPassword) {
            throw Error("Must provide new password.");
          }

          // TODO: validate password

          const { pgClient } = context;
          await pgClient.query("SAVEPOINT graphql_mutation");

          try {
            const hash = Buffer.from(await hashPassword(newPassword)).toString(
              "base64"
            );
            const newRefreshToken = createToken(uuidv4(), "7d");
            const {
              rows: [auth],
            } = await pgClient.query(
              `
                SELECT postgraphile_auth.reset_password_with_token($1, $2, $3)
              `,
              [token, hash, newRefreshToken]
            );

            return {
              success: auth?.reset_password_with_token,
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
  })
);

export default ResetPasswordWithTokenMutationPlugin;
