import * as jwt from 'jsonwebtoken';
import { UserService } from '../UserService';
import { User } from '../../entities/User';
import { UnauthorizedError } from '../../utils/errors';

export interface TokenPayload {
    userId: number;
    username: string;
    roles: string[];
}

export interface AuthResponse {
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    private userService: UserService;
    private readonly JWT_SECRET: string;
    private readonly JWT_REFRESH_SECRET: string;
    private readonly JWT_EXPIRES_IN: string;
    private readonly JWT_REFRESH_EXPIRES_IN: string;

    constructor() {
        this.userService = new UserService();
        this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
        this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    }

    async login(username: string, password: string): Promise<AuthResponse> {
        const user = await this.userService.findByUsername(username);
        
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isValidPassword = await this.userService.validatePassword(user, password);
        
        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid credentials');
        }

        return this.generateAuthResponse(user);
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload;
            const user = await this.userService.findWithRoles(decoded.userId);

            if (!user) {
                throw new UnauthorizedError('Invalid refresh token');
            }

            return this.generateAuthResponse(user);
        } catch (error) {
            throw new UnauthorizedError('Invalid refresh token');
        }
    }

    private async generateAuthResponse(user: User): Promise<AuthResponse> {
        const payload: TokenPayload = {
            userId: user.id,
            username: user.username,
            roles: user.roles.map(role => role.name)
        };

        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);

        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                roles: user.roles
            },
            accessToken,
            refreshToken
        };
    }

    private generateAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
    }

    private generateRefreshToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: this.JWT_REFRESH_EXPIRES_IN });
    }

    verifyToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
        } catch (error) {
            throw new UnauthorizedError('Invalid token');
        }
    }
}
