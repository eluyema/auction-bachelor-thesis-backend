import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtCodedUserData } from './auth.entity';

@Injectable()
export class AccessLevelGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const handler = context.getHandler();

        const accessLevels = this.reflector.get<string[]>('access-levels', handler);

        if (!accessLevels) {
            return true;
        }

        const retrivedUser = context.switchToHttp().getRequest().user as JwtCodedUserData;

        return accessLevels.some((accessLevel) => accessLevel === retrivedUser.accessLevel);
    }
}
