import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key-change-this-in-production',
        });
    }

    async validate(payload: any) {
        console.log('JWT validate payload:', payload);
        if (!payload) {
            console.error('JWT payload is empty');
            throw new UnauthorizedException('Invalid token');
        }
        return {
            id: payload.sub,
            username: payload.username,
            role: payload.role,
        };
    }
}