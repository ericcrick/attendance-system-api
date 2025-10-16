import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../audit/entities/user.entity';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto/auth.dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto): Promise<User> {
        // Check if username exists
        const existingUsername = await this.usersRepository.findOne({
            where: { username: registerDto.username },
        });

        if (existingUsername) {
            throw new ConflictException('Username already exists');
        }

        // Check if email exists
        const existingEmail = await this.usersRepository.findOne({
            where: { email: registerDto.email },
        });

        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        // Create user (password will be hashed by entity hook)
        const user = this.usersRepository.create({
            ...registerDto,
            role: registerDto.role || UserRole.ADMIN,
        });

        return this.usersRepository.save(user);
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string; user: any }> {
        // Find user by username or email
        const user = await this.usersRepository.findOne({
            where: [
                { username: loginDto.username },
                { email: loginDto.username },
            ],
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('User account is inactive');
        }

        // Validate password
        const isPasswordValid = await user.validatePassword(loginDto.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        user.lastLogin = new Date();
        await this.usersRepository.save(user);

        // Generate JWT token
        const payload = {
            sub: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        };
    }

    async validateUser(userId: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }

    async getProfile(userId: string): Promise<User> {
        return this.validateUser(userId);
    }

    async changePassword(
        userId: string,
        changePasswordDto: ChangePasswordDto,
    ): Promise<void> {
        const user = await this.validateUser(userId);

        // Verify current password
        const isCurrentPasswordValid = await user.validatePassword(
            changePasswordDto.currentPassword,
        );

        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        // Update password (will be hashed by entity hook)
        user.password = changePasswordDto.newPassword;
        await this.usersRepository.save(user);
    }

    async getAllUsers(): Promise<User[]> {
        return this.usersRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async getUserById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;
    }

    async toggleUserStatus(id: string): Promise<User> {
        const user = await this.getUserById(id);
        user.isActive = !user.isActive;
        return this.usersRepository.save(user);
    }

    async deleteUser(id: string): Promise<void> {
        const user = await this.getUserById(id);
        await this.usersRepository.remove(user);
    }
}