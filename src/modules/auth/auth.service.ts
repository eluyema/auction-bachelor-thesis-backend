import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { RegistrationDto } from './dtos/registrationDto';
import { AccessLevel } from '../users/users.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/loginDto';
import { JwtCodedUserData } from './auth.entity';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private tokenSecret: string = '';
    private tokenExpiresIn: string = '';

    constructor(
        private usersService: UsersService,
        private configService: ConfigService,
    ) {
        this.tokenSecret = this.configService.get<string>('tokenSecret');
        this.tokenExpiresIn = this.configService.get<string>('tokenExpiresIn');
    }

    private async hashPassword(plaintextPassword: string) {
        const hash = await bcrypt.hash(plaintextPassword, 10);
        return hash;
    }

    private async comparePassword(plaintextPassword: string, hash: string) {
        const result = await bcrypt.compare(plaintextPassword, hash);
        return result;
    }

    async registration(data: RegistrationDto) {
        const passwordHash = await this.hashPassword(data.password);

        const userDto = {
            name: data.name,
            email: data.email,
            passwordHash,
            accessLevel: AccessLevel.REGULAR,
        };

        return this.usersService.createUser(userDto);
    }

    async login(data: LoginDto) {
        const foundUser = await this.usersService.findUserByEmail(data.email);

        if (!foundUser) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }

        const isPasswordCorrect: boolean = await this.comparePassword(
            data.password,
            foundUser.passwordHash,
        );

        if (!isPasswordCorrect) {
            throw new HttpException('Password is wrong', HttpStatus.UNAUTHORIZED);
        }

        const codedUserData: JwtCodedUserData = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            accessLevel: foundUser.accessLevel,
        };

        const token = sign(codedUserData, this.tokenSecret, { expiresIn: this.tokenExpiresIn });

        return { token };
    }
}
