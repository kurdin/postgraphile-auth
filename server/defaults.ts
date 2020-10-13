import { CookieOptions } from "express";
import config from "./config";

export const cookieDefaults: CookieOptions = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 7,
  sameSite: "strict",
  secure: config.isProduction,
  signed: true,
};

export const jwtDefaults = {
  alg: "HS512",
  aud: "postgraphile",
  iss: config.apiUrl,
  role: "authenticated",
};
