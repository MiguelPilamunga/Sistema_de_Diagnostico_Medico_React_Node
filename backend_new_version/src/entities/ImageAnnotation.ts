import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Sample } from "./Sample";
import { User } from "./User";

@Entity("image_annotations")
export class ImageAnnotation extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sample_id!: number;

    @Column()
    user_id!: number;

    @Column("json")
    annotation_data!: any;

    @Column("float")
    x!: number;

    @Column("float")
    y!: number;

    @Column("float")
    width!: number;

    @Column("float")
    height!: number;

    @Column({ length: 50 })
    type!: string;

    @Column("text")
    text!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Sample, sample => sample.annotations)
    @JoinColumn({ name: "sample_id" })
    sample!: Sample;

    @ManyToOne(() => User, user => user.annotations)
    @JoinColumn({ name: "user_id" })
    user!: User;

    constructor(partial: Partial<ImageAnnotation> = {}) {
        super();
        Object.assign(this, partial);
    }
}
