import { User } from "../entities/User";
import { BaseRepository } from "./BaseRepository";
import { FindOneOptions } from "typeorm";

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User);
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { username },
            relations: ['roles', 'roles.permissions']
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.repository.findOne({
            where: { email }
        });
    }

    async findWithRoles(id: number): Promise<User | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['roles', 'roles.permissions']
        });
    }

    async save(user: User): Promise<User> {
        return await this.repository.save(user);
    }
}
