import { Request, Response, NextFunction } from 'express';
import { FormDetailService } from '../services/FormDetailService';
import { BaseController } from './BaseController';
import { FormDetail } from '../entities/FormDetail';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class FormDetailController extends BaseController<FormDetail> {
    private formDetailService: FormDetailService;

    constructor() {
        const service = new FormDetailService();
        super(service);
        this.formDetailService = service;
    }

    async createFormDetail(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const sampleId = parseInt(req.params.sampleId);
            const formData = { ...req.body, sample_id: sampleId };
            
            const formDetail = await this.formDetailService.create(formData);
            res.status(201).json(formDetail);
        } catch (error) {
            next(error);
        }
    }

    async getFormDetailBySample(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const sampleId = parseInt(req.params.sampleId);
            const formDetail = await this.formDetailService.findBySample(sampleId);
            if (!formDetail) {
                return res.status(404).json({ message: 'Form detail not found' });
            }
            res.json(formDetail);
        } catch (error) {
            next(error);
        }
    }
}
