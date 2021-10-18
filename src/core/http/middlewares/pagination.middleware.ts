import { IncomingMessage, ServerResponse } from "node:http";
import config from "config";
import { compile, validate } from "../../validation";
import { ValidationHttpError } from "#src/core/http/errors/validation-error.http-error";

type TNextFunction = (error?: any) => void;
export type TPagination = { page: number; perPage: number };
export interface Request extends IncomingMessage {
  query: Record<string, unknown>;
  pagination?: TPagination;
}

declare module "@tinyhttp/app" {
  interface Request {
    pagination: TPagination;
  }
}

const configPagination =
  config.get<{ perPage: number; maxPerPage: number }>("app.pagination");

compile("pagination-schema", {
  $$strict: true,
  page: {
    type: "number",
    convert: true,
    min: 0,
    integer: true,
  },
  perPage: {
    type: "number",
    convert: true,
    min: 0,
    integer: true,
    max: configPagination.maxPerPage,
  },
});

export const paginationMiddleware = async (
  request: Request,
  _response: ServerResponse,
  next: TNextFunction,
) => {
  const pagination = (request.query.pagination as TPagination) ?? {
    page: 0,
    perPage: configPagination.perPage,
  };

  const result = await validate("pagination-schema", pagination);

  if (result !== true) {
    throw new ValidationHttpError(result!);
  }

  request.pagination = { ...pagination };

  next();
};
