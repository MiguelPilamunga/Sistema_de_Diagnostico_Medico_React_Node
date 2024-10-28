import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";

@Entity("permissions")
export class Permission extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 80, unique: true })
    name!: string;

    @Column({ length: 255, nullable: true })
    description!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    constructor(partial: Partial<Permission> = {}) {
        super();
        Object.assign(this, partial);
    }
}
