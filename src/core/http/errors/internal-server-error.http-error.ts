import { AbstractHttpError } from "./abstract-http-error";

export class InternalServerHttpError extends AbstractHttpError {
  constructor(message?: string) {
    super(500, message ?? "Internal server error");
  }
}
