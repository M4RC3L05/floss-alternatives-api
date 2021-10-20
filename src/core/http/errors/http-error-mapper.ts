import { AbstractHttpError } from "#src/core/http/errors/abstract-http-error";
import { ValidationHttpError } from "#src/core/http/errors/validation-error.http-error";
import { TErrorMapper } from "#src/core/http/middlewares/error-handler.middleware";

export const httpErrorMapper: TErrorMapper = (error: Error) => {
  if (
    !(error instanceof AbstractHttpError) &&
    "code" in error &&
    (error as any).code === 404
  ) {
    return {
      mapped: true,
      status: (error as any).code as number,
      message: "Not found",
    };
  }

  if (!(error instanceof AbstractHttpError)) {
    return error;
  }

  if (error instanceof ValidationHttpError) {
    return {
      mapped: true,
      status: error.code,
      message: error.message,
      errors: error.errors,
    };
  }

  return {
    mapped: true,
    status: error.code,
    message: error.message,
  };
};
