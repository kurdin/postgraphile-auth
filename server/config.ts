import dotenv from "dotenv";
dotenv.config();

export interface ServerConfig {
  apiUrl: string;
  cookieSecret: string;
  databaseAnonymousRole: string;
  databaseAuthenticatedRole: string;
  databaseOwnerRole: string;
  databaseUrl: string;
  isProduction: boolean;
  jwtSecret: string;
  ownerConnectionString: string;
  publicUrl: string;
  serverPort: number;
}

export const getConfig = (): ServerConfig => {
  const config: ServerConfig = {
    apiUrl: process.env.API_URL!,
    cookieSecret: process.env.COOKIE_SECRET!,
    databaseAnonymousRole: process.env.DATABASE_ANONYMOUS_ROLE!,
    databaseAuthenticatedRole: process.env.DATABASE_AUTHENTICATED_ROLE!,
    databaseOwnerRole: process.env.DATABASE_OWNER_ROLE!,
    databaseUrl: process.env.DATABASE_URL!,
    isProduction: process.env.NODE_ENV! === "production",
    jwtSecret: process.env.JWT_SECRET!,
    ownerConnectionString: process.env.OWNER_CONNECTION_STRING!,
    publicUrl: process.env.PUBLIC_URL!,
    serverPort: Number(process.env.SERVER_PORT!),
  };

  for (const [k, v] of Object.entries(config)) {
    if (v === undefined) {
      throw new Error(`${k} must be defined.`);
    }
  }

  return config;
};

export default getConfig();
