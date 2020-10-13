import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import validator from "validator";
import { createUrlToken } from "../services/auth";

const ResetPasswordMutationPlugin = makeExtendSchemaPlugin((build) => ({
  typeDefs: gql`
    input ResetPasswordInput {
      email: String!
    }

    type ResetPasswordPayload {
      success: Boolean
      query: Query
    }

    extend type Mutation {
      resetPassword(input: ResetPasswordInput!): ResetPasswordPayload
    }
  `,

  resolvers: {
    Mutation: {
      resetPassword: async (_query, args, context) => {
        const { pgClient } = context;

        if (!validator.isEmail(args.input.email)) {
          throw Error("Invalid email address.");
        }

        await pgClient.query("SAVEPOINT graphql_mutation");

        try {
          const resetToken = await createUrlToken();
          await pgClient.query(
            "SELECT postgraphile_auth.reset_password($1, $2)",
            [args.input.email, resetToken]
          );

          return {
            success: true,
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

export default ResetPasswordMutationPlugin;
