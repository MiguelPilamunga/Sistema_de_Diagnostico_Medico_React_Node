// imageRoutes.ts
import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import ImageController from '../controllers/ImageController';

const router = Router();
const imageController = new ImageController();

// Middleware de logging
const logRequest = (req: Request, res: Response, next: NextFunction) => {
    console.log(`DZI Request: ${req.method} ${req.path}`);
    console.log(`Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
    next();
};

router.use(logRequest); 

router.get('/dzi/*', (req: Request, res: Response) => 
    imageController.serveDZITiles(req, res)
);

export default router;