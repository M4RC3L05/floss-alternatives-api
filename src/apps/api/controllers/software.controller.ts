import { App } from "@tinyhttp/app";
import { SoftwareRepository } from "#src/components/software/software.repository";
import { SoftwareModel } from "#src/components/software/software.model";
import { qsMiddleware as qs } from "#src/core/http/middlewares/qs.middleware";
import { paginationMiddleware as pagination } from "#src/core/http/middlewares/pagination.middleware";
import { sortMiddleware as sort } from "#src/core/http/middlewares/sort.middleware";
import { ListSoftwareUseCase } from "#src/use-cases/list-software.use-case";
import { filterMiddleware as filter } from "#src/core/http/middlewares/filter.middleware";
import { validate } from "#src/core/validation";
import { ValidationHttpError } from "#src/core/http/errors/validation-error.http-error";
import { GetSoftwareUseCase } from "#src/use-cases/get-software.use-case";

export const softwareController = (app: App) => {
  app.get(
    "/api/softwares",
    qs,
    filter,
    pagination,
    sort,
    async (request, response) => {
      const { pagination, sorting, filter } = request;
      const { results, total } = await new ListSoftwareUseCase(
        new SoftwareRepository(SoftwareModel),
      ).execute({ pagination, sorting, filter });

      return response.json({ data: results, total });
    },
  );

  app.get(
    "/api/softwares/:id",
    qs,
    filter,
    pagination,
    sort,
    async (request, response) => {
      const { id } = request.params;

      const validation = await validate({ id: "uuid" }, { id });

      if (validation !== true) {
        throw new ValidationHttpError(validation ?? []);
      }

      const software = await new GetSoftwareUseCase(
        new SoftwareRepository(SoftwareModel),
      ).execute({ id });

      return response.json({ data: software });
    },
  );
};
