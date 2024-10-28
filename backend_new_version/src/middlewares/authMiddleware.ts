import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/AuthService';
import { UnauthorizedError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        username: string;
        roles: string[];
    };
}

export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const authService = new AuthService();
        const decoded = authService.verifyToken(token);

        req.user = decoded;
        next();
    } catch (error) {
        next(new UnauthorizedError('Invalid token'));
    }
};

export const authorize = (requiredRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userRoles = req.user?.roles || [];
            const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

            if (!hasRequiredRole) {
                throw new UnauthorizedError('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};
