// Fairly directly ripped from https://github.com/graphile/starter/blob/main/%40app/server/src/middleware/installDatabasePools.ts
import { Express } from "express";
import { Pool } from "pg";
import config from "../config";

/**
 * When a PoolClient omits an 'error' event that cannot be caught by a promise
 * chain (e.g. when the PostgreSQL server terminates the link but the client
 * isn't actively being used) the error is raised via the Pool. In Node.js if
 * an 'error' event is raised and it isn't handled, the entire process exits.
 * This NOOP handler avoids this occurring on our pools.
 *
 * TODO: log this to an error reporting service.
 */
function swallowPoolError(_error: Error) {
  /* noop */
}

export default (app: Express) => {
  // This pool runs as the unprivileged user, it's what PostGraphile uses.
  const pgPool = new Pool({
    connectionString: config.databaseUrl,
  });
  pgPool.on("error", swallowPoolError);
  app.set("pgPool", pgPool);

  // TODO: actually do this somewhere!
  // pgPool.end();
};
