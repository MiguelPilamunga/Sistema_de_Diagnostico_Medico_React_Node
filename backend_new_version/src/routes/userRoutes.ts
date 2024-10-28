import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Response, NextFunction } from 'express';

const router = Router();
const userController = new UserController();

// Ruta pública para registro
router.post('/register', (req, res, next) => 
    userController.register(req, res, next)
);

// Rutas protegidas
router.get('/',
    authenticate,
    authorize(['MANAGE_USERS']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        userController.getAll(req, res, next)
);

router.post('/',
    authenticate,
    authorize(['MANAGE_USERS']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        userController.createUser(req, res, next)
);

router.get('/:id',
    authenticate,
    authorize(['MANAGE_USERS']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        userController.getById(req, res, next)
);

router.put('/:id',
    authenticate,
    authorize(['MANAGE_USERS']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        userController.update(req, res, next)
);

router.delete('/:id',
    authenticate,
    authorize(['MANAGE_USERS']),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        userController.delete(req, res, next)
);

router.put('/:id/change-password',
    authenticate,
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => 
        userController.changePassword(req, res, next)
);

export default router;
