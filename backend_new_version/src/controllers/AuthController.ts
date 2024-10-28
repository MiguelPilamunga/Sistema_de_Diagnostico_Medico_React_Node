import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/AuthService';
import { UserService } from '../services/UserService';

export class AuthController {
    private authService: AuthService;
    private userService: UserService;

    constructor() {
        this.authService = new AuthService();
        this.userService = new UserService();
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;
            const authResponse = await this.authService.login(username, password);
            res.json(authResponse);
        } catch (error) {
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            const authResponse = await this.authService.refreshToken(refreshToken);
            res.json(authResponse);
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.userId;
            const user = await this.userService.findWithRoles(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    }
}
