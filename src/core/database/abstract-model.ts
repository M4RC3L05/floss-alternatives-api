import { Model } from "objection";
import { NotFoundHttpError } from "#src/core/http/errors/not-found.http-error";

export abstract class AbstractModel extends Model {
  static get allowedFilters() {
    return [];
  }

  static createNotFoundError() {
    return new NotFoundHttpError("Entity not found");
  }
}
