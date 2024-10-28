import { 
    Repository, 
    EntityTarget, 
    FindOptionsWhere, 
    DeepPartial, 
    FindOneOptions, 
    FindManyOptions, 
    ObjectLiteral,
    BaseEntity 
} from "typeorm";
import AppDataSource from "../config/AppDataSource";

export class BaseRepository<T extends ObjectLiteral & BaseEntity> {
    protected repository: Repository<T>;

    constructor(entity: EntityTarget<T>) {
        this.repository = AppDataSource.getRepository(entity);
    }

    async findAll(options?: FindManyOptions<T>): Promise<T[]> {
        return await this.repository.find(options);
    }

    async findById(id: number, relations: string[] = []): Promise<T | null> {
        const where = {
            id: id
        } as unknown as FindOptionsWhere<T>;

        return await this.repository.findOne({
            where,
            relations
        });
    }

    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return await this.repository.save(entity);
    }

    async update(id: number, data: DeepPartial<T>): Promise<T | null> {
        const where = {
            id: id
        } as unknown as FindOptionsWhere<T>;

        await this.repository.update(where, data);
        return await this.findById(id);
    }

    async delete(id: number): Promise<boolean> {
        const where = {
            id: id
        } as unknown as FindOptionsWhere<T>;

        const result = await this.repository.delete(where);
        return result.affected ? result.affected > 0 : false;
    }

    async count(options?: FindManyOptions<T>): Promise<number> {
        return await this.repository.count(options);
    }

    async save(entity: T): Promise<T> {
        return await this.repository.save(entity);
    }
}
