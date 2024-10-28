import { TissueType } from "../entities/TissueType";
import { TissueTypeRepository } from "../repositories/TissueTypeRepository";
import { BaseService } from "./BaseService";

export class TissueTypeService extends BaseService<TissueType> {
    private tissueTypeRepository: TissueTypeRepository;

    constructor() {
        const repository = new TissueTypeRepository();
        super(repository);
        this.tissueTypeRepository = repository;
    }

    async findByName(name: string): Promise<TissueType | null> {
        return await this.tissueTypeRepository.findByName(name);
    }

    async findWithSamples(id: number): Promise<TissueType | null> {
        return await this.tissueTypeRepository.findWithSamples(id);
    }
}
