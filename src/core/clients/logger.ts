import pino from "pino";
import config from "config";

export const logger = (name = "app") =>
  pino({
    name,
    level: config.get<string>("mode") === "production" ? "info" : "trace",
    enabled: config.get<string>("mode") !== "test",
  });
