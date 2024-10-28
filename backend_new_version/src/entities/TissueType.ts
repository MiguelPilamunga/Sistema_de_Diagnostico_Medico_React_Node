import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Sample } from "./Sample";

@Entity("tissue_types")
export class TissueType extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    name!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @OneToMany(() => Sample, sample => sample.tissueType)
    samples!: Sample[];

    constructor(partial: Partial<TissueType> = {}) {
        super();
        Object.assign(this, partial);
    }
}
