import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { BaseController } from './BaseController';
import { User } from '../entities/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Role } from '../entities/Role';

export class UserController extends BaseController<User> {
    private userService: UserService;

    constructor() {
        const service = new UserService();
        super(service);
        this.userService = service;
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password, email, fullname } = req.body;
            const existingUser = await this.userService.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            const existingEmail = await this.userService.findByEmail(email);
            if (existingEmail) {
                return res.status(400).json({ message: 'Email already exists' });
            }
            const viewerRole = await Role.findOneBy({ name: 'VIEWER' });
            if (!viewerRole) {
                return res.status(500).json({ message: 'Default role not found' });
            }
            const user = await this.userService.createUser({
                username,
                password,
                email,
                fullname,
                is_active: true,
                roles: [viewerRole]
            });
            
            const { password: _, ...userWithoutPassword } = user;
            res.status(201).json(userWithoutPassword);
        } catch (error) {
            next(error);
        }
    }

    async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { roles: roleIds, ...userData } = req.body;

            const user = await this.userService.createUser(userData);
            if (roleIds && Array.isArray(roleIds)) {
                await this.userService.assignRoles(user.id, roleIds);
            }

            const userWithRoles = await this.userService.findWithRoles(user.id);
            if (!userWithRoles) {
                throw new Error('User created but could not be retrieved');
            }

            const { password: _, ...userWithoutPassword } = userWithRoles;
            res.status(201).json(userWithoutPassword);
        } catch (error) {
            next(error);
        }
    }

    async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.params.id);
            const { currentPassword, newPassword } = req.body;

            const user = await this.userService.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (req.user?.userId !== userId && !req.user?.roles.includes('ADMIN')) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const isValidPassword = await this.userService.validatePassword(user, currentPassword);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            const hashedPassword = await this.userService.createUser({
                ...user,
                password: newPassword
            });

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            next(error);
        }
    }
}
