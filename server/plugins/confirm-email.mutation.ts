import { gql, makeExtendSchemaPlugin } from "graphile-utils";

const ConfirmEmailMutationPlugin = makeExtendSchemaPlugin((build) => ({
  typeDefs: gql`
    input ConfirmEmailInput {
      token: String!
    }

    type ConfirmEmailPayload {
      success: Boolean
      query: Query
    }

    extend type Mutation {
      confirmEmail(input: ConfirmEmailInput!): ConfirmEmailPayload
    }
  `,

  resolvers: {
    Mutation: {
      confirmEmail: async (_query, args, context) => {
        const { pgClient } = context;

        await pgClient.query("SAVEPOINT graphql_mutation");

        try {
          const {
            rows: [confirmResult],
          } = await pgClient.query(
            "SELECT postgraphile_auth.confirm_email($1)",
            [args.input.token]
          );

          if (!confirmResult) {
            throw Error("Could not confirm using that token.");
          }

          return {
            success: confirmResult.confirm_email,
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

export default ConfirmEmailMutationPlugin;
