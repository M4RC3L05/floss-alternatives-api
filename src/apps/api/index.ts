import process from "node:process";
import httpTerminator from "http-terminator";
import config from "config";
import { Model } from "objection";
import { app } from "./app";
import { logger } from "#src/core/clients/logger";
import knex from "#src/core/clients/knex";

const indexLogger = logger("index");

Model.knex(knex);

const api = app();
const server = api.listen(config.get("app.port"), () => {
  indexLogger.info(`Serving on ${config.get<string>("app.port")}.`);
  process.send?.("ready");
});

const terminator = httpTerminator.createHttpTerminator({ server });

const closer = async () => {
  indexLogger.info("Shutting down...");

  await terminator.terminate();

  indexLogger.info("Shutdown completed");
  process.removeAllListeners();
};

process.addListener("unhandledRejection", async (reason) => {
  indexLogger.error(reason, "Unhandled rejection");
  await closer();
});

process.addListener("uncaughtException", async (error) => {
  indexLogger.error(error, "Unhandled rejection");
  await closer();
});

["SIGINT", "SIGTERM", "SIGUSR2"].map((x) =>
  process.addListener(x as any, async () => {
    indexLogger.error({ signal: x }, "Process signal");
    await closer();
  }),
);
