import { Sample } from "../entities/Sample";
import { BaseRepository } from "./BaseRepository";

export class SampleRepository extends BaseRepository<Sample> {
    constructor() {
        super(Sample);
    }

    async findByCode(code: string): Promise<Sample | null> {
        return await this.repository.findOne({
            where: { code },
            relations: ['tissueType', 'formDetails', 'annotations']
        });
    }

    async findByTissueType(tissueTypeId: number): Promise<Sample[]> {
        return await this.repository.find({
            where: { tissue_type_id: tissueTypeId },
            relations: ['formDetails', 'annotations']
        });
    }

    async findComplete(id: number): Promise<Sample | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['tissueType', 'formDetails', 'annotations', 'annotations.user']
        });
    }
}
