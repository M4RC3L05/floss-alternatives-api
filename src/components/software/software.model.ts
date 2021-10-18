import { AbstractModel } from "#src/core/database/abstract-model";

export class SoftwareModel extends AbstractModel {
  id!: string;
  name!: string;
  description?: string;
  lead?: string;
  iconPath?: string;
  alternativeTo?: string;
  pricing?: string;
  licence?: string;
  createdAt!: Date;
  updatedAt!: Date;

  static get tableName() {
    return `core.softwares`;
  }
}
