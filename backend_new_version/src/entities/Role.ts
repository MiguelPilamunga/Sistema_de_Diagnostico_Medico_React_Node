import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Permission } from "./Permission";

@Entity("roles")
export class Role extends BaseEntity {
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

    @ManyToMany(() => Permission)
    @JoinTable({
        name: "role_permissions",
        joinColumn: { name: "role_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "permission_id", referencedColumnName: "id" }
    })
    permissions!: Permission[];

    constructor(partial: Partial<Role> = {}) {
        super();
        Object.assign(this, partial);
    }
}
