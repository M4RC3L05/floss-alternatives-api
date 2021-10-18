import { AbstractHttpError } from "./abstract-http-error";

export class ValidationHttpError extends AbstractHttpError {
  constructor(public errors: any[]) {
    super(422, "Validation error");
  }
}
