import dotenv from "dotenv";
dotenv.config();

export interface ServerConfig {
  isProduction: boolean;
  mailgunApiKey: string;
  mailgunDomain: string;
  mailgunFromEmail: string;
  mailgunFromTitle: string;
  publicUrl: string;
}

export const getConfig = (): ServerConfig => {
  const config: ServerConfig = {
    isProduction: process.env.NODE_ENV! === "production",
    mailgunApiKey: process.env.MAILGUN_API_KEY!,
    mailgunDomain: process.env.MAILGUN_DOMAIN!,
    mailgunFromEmail: process.env.MAILGUN_FROM_EMAIL!,
    mailgunFromTitle: process.env.MAILGUN_FROM_TITLE!,
    publicUrl: process.env.PUBLIC_URL!,
  };

  for (const [k, v] of Object.entries(config)) {
    if (v === undefined) {
      throw new Error(`${k} must be defined.`);
    }
  }

  return config;
};

export default getConfig();
