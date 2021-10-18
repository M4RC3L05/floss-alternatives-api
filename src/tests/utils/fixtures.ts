import { PartialModelObject } from "objection";
import { SoftwareModel } from "#src/components/software/software.model";
import { SoftwareRepository } from "#src/components/software/software.repository";
import { app } from "#src/apps/api/app";

export const loadSoftware = async (data: PartialModelObject<SoftwareModel>) =>
  new SoftwareRepository(SoftwareModel).insert({ data });

export const loadApi = () => app();
