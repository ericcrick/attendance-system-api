// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from '../../audit/entities/user.entity';


// export interface JwtPayload {
//     sub: string;
//     username: string;
//     email: string;
//     role: string;
// }

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//     constructor(
//         private configService: ConfigService,
//         @InjectRepository(User)
//         private usersRepository: Repository<User>,
//     ) {
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             ignoreExpiration: false,
//             secretOrKey: configService.get<string>('JWT_SECRET'),
//         });
//     }

//     async validate(payload: JwtPayload): Promise<User> {
//         const user = await this.usersRepository.findOne({
//             where: { id: payload.sub },
//         });

//         if (!user || !user.isActive) {
//             throw new UnauthorizedException('User not found or inactive');
//         }

//         return user;
//     }
// }




import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../audit/entities/user.entity';

export interface JwtPayload {
    sub: string;
    username: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new Error('Missing JWT_SECRET environment variable');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret, // ✅ always a string now
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: payload.sub },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }
}
