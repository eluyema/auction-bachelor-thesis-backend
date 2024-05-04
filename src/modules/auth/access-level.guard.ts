import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtCodedUserData } from './auth.entity';

@Injectable()
export class AccessLevelGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    matchAccessLevels(accessLevels: string[], userAccessLevel: string) {
        return accessLevels.some((accessLevel) => accessLevel === userAccessLevel);
    }

    canActivate(context: ExecutionContext): boolean {
        const accessLevels = this.reflector.get<string[]>('access-levels', context.getHandler());

        if (!accessLevels) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user as JwtCodedUserData;
        return this.matchAccessLevels(accessLevels, user.accessLevel);
    }
}
