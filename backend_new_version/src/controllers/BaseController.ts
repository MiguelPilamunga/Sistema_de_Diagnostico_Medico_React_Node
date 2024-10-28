import { Request, Response, NextFunction } from 'express';
import { BaseService } from '../services/BaseService';
import { ObjectLiteral, BaseEntity } from 'typeorm';

export abstract class BaseController<T extends ObjectLiteral & BaseEntity> {
    constructor(protected service: BaseService<T>) {}

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await this.service.findAll();
            res.json(items);
        } catch (error) {
            next(error);
        }
    }

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const item = await this.service.findById(id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.json(item);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await this.service.create(req.body);
            res.status(201).json(item);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const updatedItem = await this.service.update(id, req.body);
            if (!updatedItem) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.json(updatedItem);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const deleted = await this.service.delete(id);
            if (!deleted) {
                return res.status(404).json({ message: 'Item not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
