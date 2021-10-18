import { IUseCase } from "#src/core/use-cases/iuse-case";
import { SoftwareModel } from "#src/components/software/software.model";
import { SoftwareRepository } from "#src/components/software/software.repository";
import { NotFoundHttpError } from "#src/core/http/errors/not-found.http-error";

type TInput = {
  id: string;
};
type TReturn = SoftwareModel;

export class GetSoftwareUseCase implements IUseCase<TInput, TReturn> {
  #softwareRepo: SoftwareRepository;

  constructor(softwareRepo: SoftwareRepository) {
    this.#softwareRepo = softwareRepo;
  }

  async execute({ id }: TInput): Promise<TReturn> {
    const software = await this.#softwareRepo.findOne({
      filter: {
        id: {
          eq: [id],
        },
      },
    });

    if (!software) {
      throw new NotFoundHttpError("Software not found");
    }

    return software as SoftwareModel;
  }
}
