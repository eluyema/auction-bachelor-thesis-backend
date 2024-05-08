import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { RegistrationDto } from './dtos/registrationDto';
import { AccessLevel } from '../users/users.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/loginDto';
import { JwtCodedUserData } from './auth.entity';
import { decode, sign, verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    private accessTokenSecret: string = '';
    private accessTokenExpiresIn: string = '';
    private refreshTokenSecret: string = '';
    private refreshTokenExpiresIn: string = '';

    constructor(
        private usersService: UsersService,
        private configService: ConfigService,
    ) {
        this.accessTokenSecret = this.configService.get<string>('accessTokenSecret');
        this.accessTokenExpiresIn = this.configService.get<string>('accessTokenExpiresIn');
        this.refreshTokenSecret = this.configService.get<string>('refreshTokenSecret');
        this.refreshTokenExpiresIn = this.configService.get<string>('refreshTokenExpiresIn');
    }

    static async hashPassword(plaintextPassword: string) {
        const hash = await bcrypt.hash(plaintextPassword, 10);
        return hash;
    }

    static async comparePassword(plaintextPassword: string, hash: string) {
        const result = await bcrypt.compare(plaintextPassword, hash);
        return result;
    }

    async registration(data: RegistrationDto) {
        const passwordHash = await AuthService.hashPassword(data.password);

        const userDto = {
            name: data.name,
            email: data.email,
            passwordHash,
            accessLevel: AccessLevel.REGULAR,
        };

        const foundUser = await this.usersService.findUserByEmail(userDto.email);

        if (foundUser) {
            throw new HttpException('User with this email already exit', HttpStatus.CONFLICT);
        }

        return this.usersService.createUser(userDto);
    }

    async login(data: LoginDto) {
        const foundUser = await this.usersService.findUserByEmail(data.email);

        if (!foundUser) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }

        const isPasswordCorrect: boolean = await AuthService.comparePassword(
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

        const refreshToken = sign(codedUserData, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiresIn,
        });

        foundUser.refreshToken = refreshToken;

        await this.usersService.updateUser(foundUser.email, foundUser);

        const accessToken = sign(codedUserData, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiresIn,
        });

        return { accessToken, refreshToken };
    }

    private verifyToken(token: string, secret: string) {
        try {
            verify(token, secret);
            return true;
        } catch (err) {
            return false;
        }
    }

    async refresh(refreshToken: string) {
        const verified = this.verifyToken(refreshToken, this.refreshTokenSecret);

        if (!verified) {
            throw new HttpException('Refresh token denied', HttpStatus.UNAUTHORIZED);
        }

        const decodedUser = decode(refreshToken) as JwtCodedUserData;

        const foundUser = await this.usersService.findUserByEmail(decodedUser.email);

        if (!foundUser) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }

        if (foundUser.refreshToken !== refreshToken) {
            throw new HttpException('Refresh token denied', HttpStatus.UNAUTHORIZED);
        }

        const codedUserData: JwtCodedUserData = {
            id: foundUser.id,
            email: foundUser.email,
            name: foundUser.name,
            accessLevel: foundUser.accessLevel,
        };

        const newRefreshToken = sign(codedUserData, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiresIn,
        });

        foundUser.refreshToken = newRefreshToken;

        await this.usersService.updateUser(foundUser.email, foundUser);

        const accessToken = sign(codedUserData, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiresIn,
        });

        return { accessToken, refreshToken };
    }
}
