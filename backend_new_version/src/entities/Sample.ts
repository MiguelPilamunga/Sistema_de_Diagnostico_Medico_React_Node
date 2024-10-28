import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { TissueType } from "./TissueType";
import { FormDetail } from "./FormDetail";
import { ImageAnnotation } from "./ImageAnnotation";

@Entity("samples")
export class Sample extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50, unique: true })
    code!: string;

    @Column("text")
    description!: string;

    @Column()
    is_scanned!: boolean;

    @Column()
    tissue_type_id!: number;

    @Column({ length: 255 })
    dzi_path!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => TissueType, tissueType => tissueType.samples)
    @JoinColumn({ name: "tissue_type_id" })
    tissueType!: TissueType;

    @OneToMany(() => FormDetail, formDetail => formDetail.sample)
    formDetails!: FormDetail[];

    @OneToMany(() => ImageAnnotation, annotation => annotation.sample)
    annotations!: ImageAnnotation[];

    constructor(partial: Partial<Sample> = {}) {
        super();
        Object.assign(this, partial);
    }
}
