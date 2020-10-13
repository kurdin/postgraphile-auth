import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { v4 as uuidv4 } from "uuid";
import { cookieDefaults } from "../defaults";
import { createToken } from "../services/auth";

const LogoutMutationPlugin = makeExtendSchemaPlugin((build) => ({
  typeDefs: gql`
    type LogoutPayload {
      success: Boolean
      query: Query
    }

    extend type Mutation {
      logout: LogoutPayload
    }
  `,

  resolvers: {
    Mutation: {
      logout: async (_query, _, context) => {
        const { getCookie, jwtClaims, pgClient } = context;

        if (!jwtClaims || !getCookie("refresh_token")) {
          throw Error("Access denied.");
        }

        await pgClient.query("SAVEPOINT graphql_mutation");

        try {
          context.setCookie("refresh_token", "", {
            ...cookieDefaults,
            maxAge: 0,
          });

          const newRefreshToken = createToken(uuidv4(), "7d");
          await pgClient.query(
            "SELECT postgraphile_auth.rotate_refresh_token($1, $2)",
            [newRefreshToken, jwtClaims.sub]
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

export default LogoutMutationPlugin;
