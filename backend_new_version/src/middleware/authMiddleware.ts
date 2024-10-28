import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/AuthService';
import { UserService } from '../services/UserService';
import { UnauthorizedError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
    user?: {
        userId: number;
        username: string;
        roles: string[];
        permissions: string[];
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

        const userService = new UserService();
        const user = await userService.findWithRoles(decoded.userId);
        
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        const permissions = user.roles.reduce((acc: string[], role) => {
            const rolePermissions = role.permissions.map(p => p.name);
            return [...acc, ...rolePermissions];
        }, []);

        req.user = {
            userId: user.id,
            username: user.username,
            roles: user.roles.map(role => role.name),
            permissions
        };

        next();
    } catch (error) {
        next(new UnauthorizedError('Invalid token'));
    }
};

export const authorize = (requiredPermissions: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userPermissions = req.user?.permissions || [];
            const hasRequiredPermissions = requiredPermissions.every(
                permission => userPermissions.includes(permission)
            );

            if (!hasRequiredPermissions) {
                throw new UnauthorizedError('Insufficient permissions');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const hasRole = (requiredRoles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userRoles = req.user?.roles || [];
            const hasRequiredRole = requiredRoles.some(
                role => userRoles.includes(role)
            );

            if (!hasRequiredRole) {
                throw new UnauthorizedError('Insufficient roles');
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

