import { randomUUID } from "node:crypto";
import { Server } from "node:http";
import * as assert from "uvu/assert";
import { makeFetch } from "supertest-fetch";
import { loadApi } from "../utils/fixtures";
import * as dbUtils from "../utils/database";
import { testSuite } from "#tests/utils/testing";
import * as fixtures from "#tests/utils/fixtures";
import { SoftwareModel } from "#src/components/software/software.model";

testSuite<{
  dbUtils: typeof dbUtils;
  server: Server;
}>(
  {
    name: "SoftwareController",
    context: {
      server: loadApi().listen(),
      dbUtils,
    },
  },
  (it) => {
    it.before(async ({ dbUtils: { bindKnex, setup } }) => {
      bindKnex();
      await setup();
    });

    it.after.each(async ({ dbUtils: { cleanUp } }) => {
      await cleanUp();
    });

    it.after(async ({ dbUtils: { destroy }, server }) => {
      await destroy();
      await new Promise((resolve) => {
        server.close(resolve);
      });
    });

    /**
     *  GET /api/softwares
     */

    it("should get all software paginated", async ({ server }) => {
      await fixtures.loadSoftware({ name: "foo", pricing: "paid" });
      await fixtures.loadSoftware({ name: "foo", pricing: "paid" });
      await fixtures.loadSoftware({ name: "bar", pricing: "paid" });
      const response = await makeFetch(server)(
        "/api/softwares?pagination[page]=1&pagination[perPage]=2",
      ).expectStatus(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = await response.json();

      assert.equal(body.total, 3);
      assert.equal(body.data.length, 1);
    });

    it("should allow sorting", async ({ server }) => {
      await fixtures.loadSoftware({ name: "foo", pricing: "paid" });
      await fixtures.loadSoftware({ name: "fiz", pricing: "paid" });
      await fixtures.loadSoftware({ name: "bar", pricing: "paid" });
      const response = await makeFetch(server)(
        "/api/softwares?sorting=-name",
      ).expectStatus(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = await response.json();

      assert.equal(body.total, 3);
      assert.equal(body.data[0].name, "foo");

      const response2 = await makeFetch(server)(
        "/api/softwares?sorting=name",
      ).expectStatus(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body2 = await response2.json();

      assert.equal(body2.total, 3);
      assert.equal(body2.data[0].name, "bar");
    });

    it("should allow filter", async ({ server }) => {
      await fixtures.loadSoftware({ name: "foo", pricing: "paid" });
      await fixtures.loadSoftware({ name: "fiz", pricing: "paid" });
      await fixtures.loadSoftware({ name: "bar", pricing: "paid" });
      const response = await makeFetch(server)(
        "/api/softwares?filters[name][ilk][]=%o%",
      ).expectStatus(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = await response.json();

      assert.equal(body.total, 1);
      assert.equal(body.data[0].name, "foo");
    });

    /**
     *  GET /api/softwares
     */
    it("should throw 422 if invalid uuid has software id param", async ({
      server,
    }) => {
      await makeFetch(server)("/api/softwares/foo").expectStatus(422);
    });

    it("should throw 404 if software not found", async ({ server }) => {
      await makeFetch(server)(`/api/softwares/${randomUUID()}`).expectStatus(
        404,
      );
    });

    it("should return a software", async ({ server }) => {
      const { id } = (await fixtures.loadSoftware({
        name: "foo",
        pricing: "paid",
      })) as SoftwareModel;

      await makeFetch(server)(`/api/softwares/${id}`).expectStatus(200);
    });
  },
);
