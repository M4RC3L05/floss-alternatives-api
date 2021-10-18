import { Model, ModelClass, PartialModelObject } from "objection";
import config from "config";
import {
  EFilterOp,
  TFilter,
} from "#src/core/http/middlewares/filter.middleware";
import { TSorting } from "#src/core/http/middlewares/sort.middleware";
import { TPagination } from "#src/core/http/middlewares/pagination.middleware";
import { logger } from "#src/core/clients/logger";
import { AbstractModel } from "#src/core/database/abstract-model";

const log = logger("abstract-manager");
const mapFilterToQuery = {
  [EFilterOp.EQ]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhere(prop, "=", v);
      }
    }),
  [EFilterOp.NEQ]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhere(prop, "!=", v);
      }
    }),
  [EFilterOp.GT]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhere(prop, ">", v);
      }
    }),
  [EFilterOp.GTE]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhere(prop, ">=", v);
      }
    }),
  [EFilterOp.LT]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhere(prop, "<", v);
      }
    }),
  [EFilterOp.LTE]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhere(prop, "<=", v);
      }
    }),
  [EFilterOp.IN]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhereIn(prop, v);
      }
    }),
  [EFilterOp.NIN]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhereNotIn(prop, v);
      }
    }),
  [EFilterOp.BT]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhereBetween(prop, v);
      }
    }),
  [EFilterOp.NBT]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhereNotBetween(prop, v);
      }
    }),
  [EFilterOp.LK]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhere(prop, "like", v);
      }
    }),
  [EFilterOp.NLK]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.orWhereNot(prop, "like", v);
      }
    }),
  [EFilterOp.ILK]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.where(prop, "ilike", v);
      }
    }),
  [EFilterOp.NILK]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
    value: any[],
  ) =>
    query.where((qb) => {
      for (const v of value) {
        void qb.whereNot(prop, "ilike", v);
      }
    }),
  [EFilterOp.N]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
  ) => query.whereNull(prop),
  [EFilterOp.NN]: async (
    query: ReturnType<ModelClass<Model>["query"]>,
    prop: string,
  ) => query.whereNotNull(prop),
};

export abstract class AbstractRepository<M extends AbstractModel> {
  constructor(public model: ModelClass<M>) {}

  get query() {
    return this.model.query();
  }

  async find(options?: {
    query?: ReturnType<ModelClass<M>["query"]>;
    pagination?: TPagination;
    sorting?: TSorting;
    filter?: TFilter;
  }) {
    const { query, pagination, sorting, filter } = {
      query: this.query,
      pagination: {
        page: 0,
        perPage: config.get<number>("app.pagination.perPage"),
      },
      sorting: [{ property: "createdAt", direction: "desc" }],
      ...options,
    };

    if (sorting) {
      for (const { property, direction } of sorting) {
        void query.orderBy(property, direction as "desc" | "asc");
      }
    }

    if (filter) {
      this.applyFilters(query, filter);
    }

    const q = query.page(pagination.page, pagination.perPage);

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    log.info({ query: q.toKnexQuery().toString() }, "Find");

    const data = await q;

    return data;
  }

  async findOne(options?: {
    query?: ReturnType<ModelClass<M>["query"]>;
    filter?: TFilter;
  }) {
    const { filter, query } = { query: this.query, ...options };

    if (filter) {
      this.applyFilters(query, filter);
    }

    const [entity] = await query.limit(1);

    return entity;
  }

  async insert({
    data,
    returning = "*",
  }: {
    data: PartialModelObject<M> | Array<PartialModelObject<M>>;
    returning?: string;
  }) {
    const query = Array.isArray(data)
      ? this.query.insert(data)
      : this.query.insert(data);

    if (returning) {
      void query.returning(returning);
    }

    const entity = await query;

    return entity;
  }

  async update({
    query = this.query,
    data,
    returning = "*",
  }: {
    data: PartialModelObject<M>;
    query?: ReturnType<ModelClass<M>["query"]>;
    returning?: string;
  }) {
    void query.update(data);

    if (returning) {
      void query.returning(returning);
    }

    const updatedEntity = await query;

    return updatedEntity;
  }

  async delete(options?: { query?: ReturnType<ModelClass<M>["query"]> }) {
    const { query } = { query: this.query, ...options };

    const result = await query.delete();

    return result;
  }

  applyFilters(query: ReturnType<ModelClass<M>["query"]>, filters: TFilter) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const allowed = (this.model as any).allowedFilters;

    for (const prop of Object.keys(filters)) {
      if (
        Array.isArray(allowed) &&
        allowed.length > 0 &&
        !allowed.includes(prop)
      ) {
        continue;
      }

      for (const [op, value] of Object.entries(filters[prop])) {
        if (!(op in mapFilterToQuery)) {
          continue;
        }

        void mapFilterToQuery[op as keyof typeof mapFilterToQuery](
          query,
          prop,
          value,
        );
      }
    }
  }
}
