import { App } from "@tinyhttp/app";
import helmet from "helmet";
import { cors } from "@tinyhttp/cors";
import config from "config";
import { router } from "./router";
import { errorHandlerMiddleware } from "#src/core/http/middlewares/error-handler.middleware";
import { httpErrorMapper } from "#src/core/http/errors/http-error-mapper";

export const app = () => {
  const app = new App({
    onError: errorHandlerMiddleware({ mappers: [httpErrorMapper] }),
  });

  if (config.get<string>("mode") === "development") {
    app.use(async (...args) => {
      // eslint-disable-next-line node/no-unsupported-features/es-syntax
      const { logger } = await import("@tinyhttp/logger");

      logger({ emoji: true })(...args);
    });
  }

  app.use(helmet());
  app.use(cors());

  router(app);

  return app;
};
