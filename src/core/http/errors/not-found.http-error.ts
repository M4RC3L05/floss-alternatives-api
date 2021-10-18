import { AbstractHttpError } from "./abstract-http-error";

export class NotFoundHttpError extends AbstractHttpError {
  constructor(message?: string) {
    super(404, message ?? "Not found");
  }
}
