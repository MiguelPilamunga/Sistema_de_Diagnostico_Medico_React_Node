import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { Role } from "./Role";
import { ImageAnnotation } from "./ImageAnnotation";

@Entity("users")
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 50, unique: true })
    username!: string;

    @Column({ length: 255 })
    password!: string;

    @Column({ length: 120, unique: true })
    email!: string;

    @Column({ length: 120 })
    fullname!: string;

    @Column({ default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToMany(() => Role)
    @JoinTable({
        name: "user_roles",
        joinColumn: { name: "user_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "role_id", referencedColumnName: "id" }
    })
    roles!: Role[];

    @OneToMany(() => ImageAnnotation, annotation => annotation.user)
    annotations!: ImageAnnotation[];

    constructor(partial: Partial<User> = {}) {
        super();
        Object.assign(this, partial);
    }
}
