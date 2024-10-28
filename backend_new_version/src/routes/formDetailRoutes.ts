import { Router } from 'express';
import { FormDetailController } from '../controllers/FormDetailController';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response, NextFunction } from 'express';

const router = Router({ mergeParams: true }); // Importante: mergeParams para acceder a params de la ruta padre
const formDetailController = new FormDetailController();

router.post('/',
    authenticate,
    authorize(['MANAGE_FORMS']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        formDetailController.createFormDetail(req, res, next)
);

router.get('/',
    authenticate,
    authorize(['VIEW_SAMPLES']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
        formDetailController.getFormDetailBySample(req, res, next)
);

export default router;
