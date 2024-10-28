import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Sample } from "./Sample";

@Entity("form_details")
export class FormDetail extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sample_id!: number;

    @Column({ length: 100 })
    patient_name!: string;

    @Column()
    birth_date!: Date;

    @Column({ length: 50 })
    patient_id!: string;

    @Column()
    procedure_date!: Date;

    @Column({ length: 50 })
    sample_type!: string;

    @Column({ length: 100 })
    anatomical_location!: string;

    @Column({ length: 100 })
    dimensions!: string;

    @Column({ length: 100 })
    texture!: string;

    @Column({ length: 50 })
    cell_type!: string;

    @Column("decimal", { precision: 5, scale: 2 })
    ki67_index!: number;

    @Column({ length: 20 })
    her2_status!: string;

    @Column({ length: 20 })
    brca_type!: string;

    @Column({ length: 50 })
    tnm_classification!: string;

    @Column("text")
    recommendations!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Sample, sample => sample.formDetails)
    @JoinColumn({ name: "sample_id" })
    sample!: Sample;

    constructor(partial: Partial<FormDetail> = {}) {
        super();
        Object.assign(this, partial);
    }
}
