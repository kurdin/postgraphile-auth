import jwt from "jsonwebtoken";
import { SodiumPlus } from "sodium-plus";
import config from "../config";
import { jwtDefaults } from "../defaults";

let sodium: SodiumPlus;

export const hashPassword = async (password: string): Promise<string> => {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  return sodium.crypto_pwhash_str(
    password,
    sodium.CRYPTO_PWHASH_OPSLIMIT_INTERACTIVE,
    sodium.CRYPTO_PWHASH_MEMLIMIT_INTERACTIVE
  );
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  // TODO: any need for a hash rotation check here first?
  return sodium.crypto_pwhash_str_verify(
    password,
    Buffer.from(hash, "base64").toString("utf-8")
  );
};

export const createToken = (
  sub: string,
  expiresIn: number | string = 60 * 15
): string =>
  jwt.sign(
    {
      ...jwtDefaults,
      sub,
    },
    config.jwtSecret,
    {
      expiresIn,
    }
  );

export const createUrlToken = async () => {
  if (!sodium) {
    sodium = await SodiumPlus.auto();
  }

  const buf = await sodium.randombytes_buf(50);
  return buf.toString("base64");
};
