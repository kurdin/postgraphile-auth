import { Express } from "express";
import { run } from "graphile-worker";
import path from "path";

export const createWorkerTasks = async (app: Express) => {
  const taskRunner = await run({
    pgPool: app.get("pgPool"),
    concurrency: 5,
    noHandleSignals: false,
    pollInterval: 1000,
    taskDirectory: path.join(__dirname, "..", "worker", "tasks"),
  });

  app.set("taskRunner", taskRunner);
};

export default createWorkerTasks;
