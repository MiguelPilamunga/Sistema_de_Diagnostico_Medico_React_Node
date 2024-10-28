import { FormDetail } from "../entities/FormDetail";
import { BaseRepository } from "./BaseRepository";

export class FormDetailRepository extends BaseRepository<FormDetail> {
    constructor() {
        super(FormDetail);
    }

    async findBySample(sampleId: number): Promise<FormDetail | null> {
        return await this.repository.findOne({
            where: { sample_id: sampleId },
            relations: ['sample']
        });
    }

    async findByPatientId(patientId: string): Promise<FormDetail[]> {
        return await this.repository.find({
            where: { patient_id: patientId },
            relations: ['sample'],
            order: { created_at: 'DESC' }
        });
    }
}
