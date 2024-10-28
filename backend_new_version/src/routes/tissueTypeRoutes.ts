import { Router } from 'express';
import { TissueTypeController } from '../controllers/TissueTypeController';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response, NextFunction } from 'express';

const router = Router();
const tissueTypeController = new TissueTypeController();

// Obtener todos los tipos de tejido
router.get('/',
    authenticate,
    authorize(['VIEW_SAMPLES']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        tissueTypeController.getAllTissueTypes(req, res, next)
);

// Crear nuevo tipo de tejido
router.post('/',
    authenticate,
    authorize(['MANAGE_TISSUE_TYPES']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        tissueTypeController.createTissueType(req, res, next)
);

// Actualizar tipo de tejido
router.put('/:id',
    authenticate,
    authorize(['MANAGE_TISSUE_TYPES']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        tissueTypeController.updateTissueType(req, res, next)
);

// Eliminar tipo de tejido
router.delete('/:id',
    authenticate,
    authorize(['MANAGE_TISSUE_TYPES']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        tissueTypeController.deleteTissueType(req, res, next)
);

export default router;
