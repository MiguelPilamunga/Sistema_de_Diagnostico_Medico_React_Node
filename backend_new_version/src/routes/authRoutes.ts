import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/authMiddleware';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const authController = new AuthController();

router.post('/login', (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

router.post('/refresh-token', (req: Request, res: Response, next: NextFunction) => 
    authController.refreshToken(req, res, next)
);

router.get('/profile',
    authenticate, 
    (req: AuthenticatedRequest, res: Response) => {
        res.json({ user: req.user });
    }
);

router.get('/permissions', 
    authenticate, 
    (req: AuthenticatedRequest, res: Response) => {
        res.json({ permissions: req.user?.permissions });
    }
);

export default router;
