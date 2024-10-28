import { FormDetail } from "../entities/FormDetail";
import { FormDetailRepository } from "../repositories/FormDetailRepository";
import { BaseService } from "./BaseService";

export class FormDetailService extends BaseService<FormDetail> {
    private formDetailRepository: FormDetailRepository;

    constructor() {
        const repository = new FormDetailRepository();
        super(repository);
        this.formDetailRepository = repository;
    }

    async findBySample(sampleId: number): Promise<FormDetail | null> {
        return await this.formDetailRepository.findBySample(sampleId);
    }

    async findByPatientId(patientId: string): Promise<FormDetail[]> {
        return await this.formDetailRepository.findByPatientId(patientId);
    }
}
