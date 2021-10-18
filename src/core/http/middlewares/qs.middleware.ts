import { IncomingMessage, ServerResponse } from "node:http";
import qs from "qs";

type TNextFunction = (error?: any) => void;

export interface IRequest extends IncomingMessage {
  query: Record<string, unknown>;
}

export const qsMiddleware = (
  request: IRequest,
  _response: ServerResponse,
  next: TNextFunction,
) => {
  const querystring = new URL(
    request.url!,
    `http://${request.headers.host!}`,
  ).search.slice(1);
  request.query = qs.parse(querystring, { comma: true });

  next();
};
