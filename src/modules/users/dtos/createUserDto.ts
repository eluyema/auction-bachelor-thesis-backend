import { AccessLevelType } from '../users.entity';

export class CreateUserDto {
    name: string;
    email: string;
    passwordHash: string;
    accessLevel: AccessLevelType;
}
