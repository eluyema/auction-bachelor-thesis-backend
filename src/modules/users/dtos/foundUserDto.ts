import { AccessLevelType } from '../users.entity';

export class FoundUserDto {
    id: string;
    name: string;
    email: string;
    accessLevel: AccessLevelType;
}
