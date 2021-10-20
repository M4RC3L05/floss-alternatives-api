/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.withSchema("core").createTable("softwares", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("name").notNullable();
    table.text("description").nullable();
    table.text("lead").nullable();
    table.text("iconPath").nullable();
    table
      .uuid("alternativeTo")
      .nullable()
      .references("id")
      .inTable(`${"core"}.softwares`);
    table.enum("pricing", ["free", "freemium", "paid"]).notNullable();
    table.text("licence").nullable();
    table.timestamp("createdAt", { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp("updatedAt", { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.raw(
    `create trigger update_timestamp before update on "core"."softwares" for each row execute procedure "core".update_timestamp()`,
  );
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.withSchema("core").dropTable("softwares");
}
