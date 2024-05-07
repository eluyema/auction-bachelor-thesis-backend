import { Request } from 'express';
import { JwtCodedUserData } from 'src/modules/auth/auth.entity';

export type AuthRequest = Request & { user: JwtCodedUserData };
