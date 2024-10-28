import { TissueType } from "../entities/TissueType";
import { BaseRepository } from "./BaseRepository";

export class TissueTypeRepository extends BaseRepository<TissueType> {
    constructor() {
        super(TissueType);
    }

    async findByName(name: string): Promise<TissueType | null> {
        return await this.repository.findOne({
            where: { name },
            relations: ['samples']
        });
    }

    async findWithSamples(id: number): Promise<TissueType | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['samples']
        });
    }
}
