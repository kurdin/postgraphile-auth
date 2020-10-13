import pgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import { CookieOptions, Express, Request, Response } from "express";
import { IncomingMessage, ServerResponse } from "http";
import postgraphile, { PostGraphileOptions } from "postgraphile";
import config from "../config";
import AccessTokenQueryPlugin from "../plugins/accessToken.query";
import ChangePasswordMutationPlugin from "../plugins/change-password.mutation";
import ConfirmEmailMutationPlugin from "../plugins/confirm-email.mutation";
import LoginMutationPlugin from "../plugins/login.mutation";
import LogoutMutationPlugin from "../plugins/logout.mutation";
import RegisterMutationPlugin from "../plugins/register.mutation";
import ResetPasswordWithTokenMutationPlugin from "../plugins/reset-password-with-token.mutation";
import ResetPasswordMutationPlugin from "../plugins/reset-password.mutation";

export const additionalGraphQLContextFromRequest = async (
  req: IncomingMessage,
  res: ServerResponse
) => ({
  clearCookie: (name: string, options: CookieOptions) =>
    (res as Response).clearCookie(name, options),
  getCookie: (name: string) => (req as Request).signedCookies[name],
  setCookie: (name: string, value: string, options: CookieOptions) =>
    (res as Response).cookie(name, value, options),
});

const commonPostgraphileOptions: PostGraphileOptions = {
  additionalGraphQLContextFromRequest,
  appendPlugins: [
    pgSimplifyInflectorPlugin,
    AccessTokenQueryPlugin,
    ChangePasswordMutationPlugin,
    ConfirmEmailMutationPlugin,
    LoginMutationPlugin,
    LogoutMutationPlugin,
    RegisterMutationPlugin,
    ResetPasswordMutationPlugin,
    ResetPasswordWithTokenMutationPlugin,
  ],
  dynamicJson: true,
  enableQueryBatching: true,
  ignoreIndexes: false,
  ignoreRBAC: false,
  jwtSecret: config.jwtSecret,
  jwtVerifyOptions: {
    algorithms: ["HS256"],
  },
  legacyRelations: "omit",
  pgDefaultRole: "anonymous",
  retryOnInitFail: true,
  setofFunctionsContainNulls: false,
  subscriptions: true,
};

const developmentPostgraphileOptions: PostGraphileOptions = {
  ...commonPostgraphileOptions,
  allowExplain: () => true,
  enhanceGraphiql: true,
  exportGqlSchemaPath: "schema.graphql",
  extendedErrors: ["hint", "detail", "errcode"],
  graphiql: true,
  ownerConnectionString: config.ownerConnectionString,
  showErrorStack: "json",
  watchPg: true,
};

const productionPostgraphileOptions: PostGraphileOptions = {
  ...commonPostgraphileOptions,
  disableQueryLog: true, // our default logging has performance issues, but do make sure you have a logging system in place!
  extendedErrors: ["errcode"],
  graphiql: false,
  retryOnInitFail: true,
};

export const postgraphileHandler = (app: Express) =>
  postgraphile(
    app.get("pgPool"),
    "protected",
    config.isProduction
      ? productionPostgraphileOptions
      : developmentPostgraphileOptions
  );
