import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import config from "./config";
import { globalErrorHandler } from "./errors";
import emailRouter from "./routes/email";
import { postgraphileHandler } from "./routes/postgraphile";
import createDatabasePools from "./services/db";
import { createWorkerTasks } from "./worker";

const app = express();

createDatabasePools(app);
createWorkerTasks(app);

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser(config.cookieSecret));
app.use("/_e", emailRouter);
app.use(postgraphileHandler(app));
app.use(globalErrorHandler);

app.listen(config.serverPort, () =>
  console.log(`postgraphile-auth server listening on ${config.serverPort}`)
);
