import { AccessLevelType } from '../users/users.entity';

export class JwtCodedUserData {
    id: string;
    name: string;
    email: string;
    accessLevel: AccessLevelType;
}
