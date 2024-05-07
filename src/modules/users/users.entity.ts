export const AccessLevel = {
    REGULAR: 'REGULAR',
    MANAGER: 'MANAGER',
    ADMIN: 'ADMIN',
} as const;

export type AccessLevelType = (typeof AccessLevel)[keyof typeof AccessLevel];

export class User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    accessLevel: AccessLevelType;
    refreshToken: string | null;
}
