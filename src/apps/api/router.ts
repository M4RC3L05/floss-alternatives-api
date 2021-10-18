import { App } from "@tinyhttp/app";
import { softwareController } from "./controllers/software.controller";

export const router = (app: App) => {
  softwareController(app);
};
