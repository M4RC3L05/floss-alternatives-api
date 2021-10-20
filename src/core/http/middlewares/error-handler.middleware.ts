import { Request, Response } from "@tinyhttp/app";
import { logger } from "#src/core/clients/logger";

const log = logger("error-handler-middleware");

export type TMappedError = {
  mapped: true;
  status: number;
  message: string;
  errors?: Array<Record<string, unknown>>;
};
export type TErrorMapper = (error: any) => Error | TMappedError;

export const errorHandlerMiddleware =
  ({ mappers }: { mappers: TErrorMapper[] }) =>
  (error: any, _request: Request, response: Response) => {
    log.error(error, "Caught error.");

    for (const mapper of mappers) {
      error = mapper(error);

      if ((error as TMappedError).mapped) {
        break;
      }
    }

    if (!(error as TMappedError).mapped) {
      error = {
        status: 500,
        message: "Internal server error.",
      };
    }

    response
      .status(error.status)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      .json({ error: { ...error, mapped: undefined } });
  };
