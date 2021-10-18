import { Model } from "objection";
import knex from "#src/core/clients/knex";

export const bindKnex = () => {
  Model.knex(knex);
};

export const setup = async () => {
  await knex.migrate.latest();
};

export const cleanUp = async () => {
  const tables = await knex
    .select("table_name")
    .from("information_schema.tables")
    .where("table_schema", "core");

  await knex.raw(
    `truncate table ${tables
      .map(({ table_name }) => `"core"."${table_name as string}"`)
      .join(", ")} cascade`,
  );
};

export const destroy = async () => {
  await knex.migrate.rollback(undefined, true);
  await knex.destroy();
};
