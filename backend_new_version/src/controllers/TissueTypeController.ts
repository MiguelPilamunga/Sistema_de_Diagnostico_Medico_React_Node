import { Request, Response, NextFunction } from 'express';
import { TissueTypeService } from '../services/TissueTypeService';
import { BaseController } from './BaseController';
import { TissueType } from '../entities/TissueType';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class TissueTypeController extends BaseController<TissueType> {
    private tissueTypeService: TissueTypeService;

    constructor() {
        const service = new TissueTypeService();
        super(service);
        this.tissueTypeService = service;
    }

    async getAllTissueTypes(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const tissues = await this.tissueTypeService.findAll();
            res.json(tissues);
        } catch (error) {
            next(error);
        }
    }

    async createTissueType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const tissueType = await this.tissueTypeService.create(req.body);
            res.status(201).json(tissueType);
        } catch (error) {
            next(error);
        }
    }

    async updateTissueType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const tissueType = await this.tissueTypeService.update(id, req.body);
            if (!tissueType) {
                return res.status(404).json({ message: 'Tissue type not found' });
            }
            res.json(tissueType);
        } catch (error) {
            next(error);
        }
    }

    async deleteTissueType(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id);
            const result = await this.tissueTypeService.delete(id);
            if (!result) {
                return res.status(404).json({ message: 'Tissue type not found' });
            }
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
