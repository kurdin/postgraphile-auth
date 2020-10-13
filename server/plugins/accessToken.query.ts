import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { createToken } from "../services/auth";

const AccessTokenQueryPlugin = makeExtendSchemaPlugin((build) => ({
  typeDefs: gql`
    type AccessTokenPayload {
      token: String
      query: Query
    }

    extend type Query {
      accessToken: AccessTokenPayload
    }
  `,

  resolvers: {
    Query: {
      accessToken: async (_query, _, context) => {
        const { getCookie, pgClient } = context;

        const refreshToken = getCookie("refresh_token");
        if (!refreshToken) {
          throw Error("Access denied.");
        }

        const {
          rows: [auth],
        } = await pgClient.query(
          "SELECT * FROM postgraphile_auth.check_refresh_token($1)",
          [refreshToken]
        );

        if (!auth) {
          throw Error("Invalid or expired refresh token.");
        }

        if (!auth.email_confirmed) {
          throw Error("Email has not been confirmed.");
        }

        if (auth.reset_required) {
          throw Error("Password reset required.");
        }

        const token = createToken(auth.user_id);

        return {
          token,
          query: build.$$isQuery,
        };
      },
    },
  },
}));

export default AccessTokenQueryPlugin;
