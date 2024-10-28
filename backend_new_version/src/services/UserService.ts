import { User } from "../entities/User";
import { UserRepository } from "../repositories/UserRepository";
import { BaseService } from "./BaseService";
import { Role } from "../entities/Role";
import * as bcrypt from 'bcryptjs';

interface CreateUserDto {
    username: string;
    password: string;
    email: string;
    fullname: string;
    is_active?: boolean;
    roles?: Role[];
}

export class UserService extends BaseService<User> {
    private userRepository: UserRepository;

    constructor() {
        const repository = new UserRepository();
        super(repository);
        this.userRepository = repository;
    }

    async createUser(userData: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const user = new User({
            ...userData,
            password: hashedPassword,
            is_active: userData.is_active ?? true
        });

        return await this.create(user);
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.userRepository.findByUsername(username);
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findByEmail(email);
    }

    async validatePassword(user: User, password: string): Promise<boolean> {
        return await bcrypt.compare(password, user.password);
    }

    async findWithRoles(id: number): Promise<User | null> {
        return await this.userRepository.findWithRoles(id);
    }

    async assignRoles(userId: number, roleIds: number[]): Promise<User | null> {
        const user = await this.findById(userId);
        if (!user) return null;

        const roles = await Promise.all(
            roleIds.map(id => Role.findOneBy({ id }))
        );

        user.roles = roles.filter((role): role is Role => role !== null);
        return await this.userRepository.save(user);
    }
}
