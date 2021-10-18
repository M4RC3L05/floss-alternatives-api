import { IncomingMessage, ServerResponse } from "node:http";
import { compile, validate } from "#src/core/validation";
import { ValidationHttpError } from "#src/core/http/errors/validation-error.http-error";

export enum EFilterOp {
  EQ = "eq",
  NEQ = "neq",
  GT = "gt",
  GTE = "gte",
  LT = "lt",
  LTE = "lte",
  IN = "in",
  NIN = "nin",
  BT = "bt",
  NBT = "nbt",
  LK = "lk",
  NLK = "nlk",
  ILK = "ilk",
  NILK = "nilk",
  N = "n",
  NN = "nn",
}
type TNextFunction = (error?: any) => void;
export type TFilter = Record<
  string,
  {
    [EFilterOp.BT]?: [string, string];
    [EFilterOp.EQ]?: string[];
    [EFilterOp.GT]?: string[];
    [EFilterOp.GTE]?: string[];
    [EFilterOp.ILK]?: string[];
    [EFilterOp.IN]?: string[];
    [EFilterOp.LK]?: string[];
    [EFilterOp.LT]?: string[];
    [EFilterOp.LTE]?: string[];
    [EFilterOp.N]?: string[];
    [EFilterOp.NBT]?: [string, string];
    [EFilterOp.NEQ]?: string[];
    [EFilterOp.NILK]?: string[];
    [EFilterOp.NIN]?: string[];
    [EFilterOp.NLK]?: string[];
    [EFilterOp.NN]?: string[];
  }
>;
export interface Request extends IncomingMessage {
  query: Record<string, unknown>;
  filter?: TFilter;
}

declare module "@tinyhttp/app" {
  interface Request {
    filter: TFilter;
  }
}

compile("filter-schema", {
  $$strict: true,
  [EFilterOp.EQ]: { type: "array", optional: true, items: "string" },
  [EFilterOp.NEQ]: { type: "array", optional: true, items: "string" },
  [EFilterOp.GT]: { type: "array", optional: true, items: "string" },
  [EFilterOp.GTE]: { type: "array", optional: true, items: "string" },
  [EFilterOp.LT]: { type: "array", optional: true, items: "string" },
  [EFilterOp.LTE]: { type: "array", optional: true, items: "string" },
  [EFilterOp.IN]: {
    type: "array",
    optional: true,
    items: { type: "array", items: "string" },
  },
  [EFilterOp.NIN]: {
    type: "array",
    optional: true,
    items: { type: "array", items: "string" },
  },
  [EFilterOp.BT]: {
    type: "array",
    optional: true,
    items: { type: "array", items: "string", length: 2 },
  },
  [EFilterOp.NBT]: {
    type: "array",
    optional: true,
    items: { type: "array", items: "string", length: 2 },
  },
  [EFilterOp.LK]: { type: "array", optional: true, items: "string" },
  [EFilterOp.NLK]: { type: "array", optional: true, items: "string" },
  [EFilterOp.ILK]: { type: "array", optional: true, items: "string" },
  [EFilterOp.NILK]: { type: "array", optional: true, items: "string" },
  [EFilterOp.N]: { type: "any", optional: true, nullable: true },
  [EFilterOp.NN]: { type: "any", optional: true, nullable: true },
});

export const filterMiddleware = async (
  request: Request,
  _response: ServerResponse,
  next: TNextFunction,
) => {
  const filters = (request.query.filters as TFilter) ?? {};

  const result = await Promise.allSettled(
    Object.keys(filters).map(async (prop) =>
      validate("filter-schema", (filters as any)[prop]),
    ),
  ).then((value) =>
    // eslint-disable-next-line unicorn/no-array-reduce
    value.reduce<unknown[]>((acc, curr) => {
      if ((curr as PromiseFulfilledResult<any>).value === true) {
        return acc;
      }

      acc.push(...(curr as PromiseFulfilledResult<any>).value);
      return acc;
    }, []),
  );

  if (result.length > 0) {
    throw new ValidationHttpError(result);
  }

  request.filter = filters;

  next();
};
