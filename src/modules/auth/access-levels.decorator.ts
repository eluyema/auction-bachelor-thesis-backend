import { SetMetadata } from '@nestjs/common';
import { AccessLevelType } from '../users/users.entity';

export const AccessLevels = (...args: AccessLevelType[]) => SetMetadata('access-levels', args);
