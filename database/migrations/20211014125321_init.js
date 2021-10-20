/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.createSchema("core");
  await knex.raw(`create extension if not exists citext`);
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  await knex.raw(`
    CREATE OR REPLACE FUNCTION "core".update_timestamp() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS
    $$
    BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$;
  `);
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.raw(`drop schema "core" cascade`);
}
