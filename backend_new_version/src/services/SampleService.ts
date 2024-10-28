import { Sample } from "../entities/Sample";
import { SampleRepository } from "../repositories/SampleRepository";
import { BaseService } from "./BaseService";

export class SampleService extends BaseService<Sample> {
    private sampleRepository: SampleRepository;

    constructor() {
        const repository = new SampleRepository();
        super(repository);
        this.sampleRepository = repository;
    }

    async findByCode(code: string): Promise<Sample | null> {
        return await this.sampleRepository.findByCode(code);
    }

    async findByTissueType(tissueTypeId: number): Promise<Sample[]> {
        return await this.sampleRepository.findByTissueType(tissueTypeId);
    }

    async findComplete(id: number): Promise<Sample | null> {
        return await this.sampleRepository.findComplete(id);
    }
}
