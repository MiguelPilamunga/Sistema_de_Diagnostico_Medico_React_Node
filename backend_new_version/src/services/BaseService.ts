import { DeepPartial, FindManyOptions, ObjectLiteral, BaseEntity } from "typeorm";
import { BaseRepository } from "../repositories/BaseRepository";

export class BaseService<T extends ObjectLiteral & BaseEntity> {
    constructor(protected repository: BaseRepository<T>) {}

    async findAll(options?: FindManyOptions<T>): Promise<T[]> {
        return await this.repository.findAll(options);
    }

    async findById(id: number, relations: string[] = []): Promise<T | null> {
        return await this.repository.findById(id, relations);
    }

    async create(data: DeepPartial<T>): Promise<T> {
        return await this.repository.create(data);
    }

    async update(id: number, data: DeepPartial<T>): Promise<T | null> {
        return await this.repository.update(id, data);
    }

    async delete(id: number): Promise<boolean> {
        return await this.repository.delete(id);
    }

    async count(options?: FindManyOptions<T>): Promise<number> {
        return await this.repository.count(options);
    }
}
