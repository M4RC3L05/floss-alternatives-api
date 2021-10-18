/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.createSchema("core");
  await knex.raw(`create extension citext schema "core"`);
  await knex.raw(`create extension "uuid-ossp" schema "core"`);
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
