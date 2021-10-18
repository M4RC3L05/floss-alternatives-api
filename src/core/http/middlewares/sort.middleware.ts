import { IncomingMessage, ServerResponse } from "node:http";
import { compile, validate } from "../../validation";
import { ValidationHttpError } from "#src/core/http/errors/validation-error.http-error";

type TNextFunction = (error?: any) => void;
export type TSorting = Array<{ property: string; direction: "asc" | "desc" }>;
export interface IRequest extends IncomingMessage {
  query: Record<string, unknown>;
  sorting?: TSorting;
}

declare module "@tinyhttp/app" {
  interface Request {
    sorting: TSorting;
  }
}

compile("sorting-schema", {
  $$root: true,
  optional: true,
  type: "array",
  items: {
    type: "string",
    pattern: "^\\-?([a-zA-Z]+)$",
  },
  unique: true,
});

export const sortMiddleware = async (
  request: IRequest,
  _response: ServerResponse,
  next: TNextFunction,
) => {
  let { sorting = [] } = request.query;
  sorting = typeof sorting === "string" ? [sorting] : sorting;

  const result = await validate("sorting-schema", sorting);

  if (result !== true) {
    throw new ValidationHttpError(result!);
  }

  request.sorting = (sorting as string[]).map<{
    property: string;
    direction: "asc" | "desc";
  }>((item) =>
    item.trim().includes("-")
      ? { property: item.trim().slice(1), direction: "desc" }
      : { property: item.trim(), direction: "asc" },
  ) as TSorting;

  next();
};
