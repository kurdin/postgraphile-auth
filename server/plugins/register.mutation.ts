import { gql, makeExtendSchemaPlugin } from "graphile-utils";
import { v4 as uuidv4 } from "uuid";
import validator from "validator";
import { createUrlToken, hashPassword } from "../services/auth";

const RegisterMutationPlugin = makeExtendSchemaPlugin((build) => ({
  typeDefs: gql`
    input RegisterInput {
      email: String!
      password: String!
      fullName: String!
    }

    type RegisterPayload {
      success: Boolean
      query: Query
    }

    extend type Mutation {
      register(input: RegisterInput!): RegisterPayload
    }
  `,

  resolvers: {
    Mutation: {
      register: async (_query, args, context) => {
        const { jwtClaims, pgClient } = context;
        await pgClient.query("SAVEPOINT graphql_mutation");

        if (jwtClaims) {
          throw Error("You already have an account.");
        }

        if (!validator.isEmail(args.input.email)) {
          throw Error("Invalid email address.");
        }

        try {
          const {
            rows: [{ existing_user }],
          } = await pgClient.query(
            "SELECT postgraphile_auth.user_account_exists($1) AS existing_user",
            [args.input.email]
          );

          if (existing_user) {
            // TODO: consider not revealing this.
            throw Error("User already exists.");
          }

          const hash = Buffer.from(
            await hashPassword(args.input.password)
          ).toString("base64");
          const refreshToken = uuidv4();
          const confirmToken = await createUrlToken();

          await pgClient.query(
            "SELECT postgraphile_auth.create_account($1, $2, $3, $4, $5)",
            [
              args.input.email,
              args.input.fullName,
              hash,
              confirmToken,
              refreshToken,
            ]
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

export default RegisterMutationPlugin;
