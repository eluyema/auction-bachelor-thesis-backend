import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtCodedUserData } from './auth.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('tokenSecret'),
        });
    }

    async validate(payload: JwtCodedUserData): Promise<JwtCodedUserData> {
        return {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            accessLevel: payload.accessLevel,
        };
    }
}
