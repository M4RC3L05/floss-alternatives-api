import { Page } from "objection";
import { IUseCase } from "#src/core/use-cases/iuse-case";
import { SoftwareModel } from "#src/components/software/software.model";
import { SoftwareRepository } from "#src/components/software/software.repository";
import { TFilter } from "#src/core/http/middlewares/filter.middleware";
import { TPagination } from "#src/core/http/middlewares/pagination.middleware";
import { TSorting } from "#src/core/http/middlewares/sort.middleware";

type TInput = {
  pagination: TPagination;
  sorting: TSorting;
  filter: TFilter;
};
type TReturn = Page<SoftwareModel>;

export class ListSoftwareUseCase implements IUseCase<TInput, TReturn> {
  #softwareRepo: SoftwareRepository;

  constructor(softwareRepo: SoftwareRepository) {
    this.#softwareRepo = softwareRepo;
  }

  async execute({ pagination, sorting, filter }: TInput): Promise<TReturn> {
    return this.#softwareRepo.find({
      pagination,
      sorting,
      filter,
    }) as Promise<Page<SoftwareModel>>;
  }
}
