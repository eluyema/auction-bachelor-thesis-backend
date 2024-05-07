import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dtos/createUserDto';
import { User } from './users.entity';
import { FoundUserDto } from './dtos/foundUserDto';

@Injectable()
export class UsersService {
    constructor(private repository: UsersRepository) {}

    async createUser(userDto: CreateUserDto) {
        const newUserData = {
            name: userDto.name,
            email: userDto.email,
            accessLevel: userDto.accessLevel,
            passwordHash: userDto.passwordHash,
        };

        const createdUser = await this.repository.createUser({
            data: newUserData,
        });

        return createdUser;
    }

    async updateUser(email: string, updateUserDto: Partial<User>): Promise<FoundUserDto | null> {
        const userToUpdateArr = await this.repository.getUsers({ where: { email } });

        if (!userToUpdateArr.length) {
            return null;
        }

        const userToUpdate = userToUpdateArr[0];

        if (updateUserDto.name) {
            userToUpdate.name = updateUserDto.name;
        }
        if (updateUserDto.email) {
            userToUpdate.email = updateUserDto.email;
        }
        if (updateUserDto.accessLevel) {
            userToUpdate.accessLevel = updateUserDto.accessLevel;
        }
        if (updateUserDto.refreshToken) {
            userToUpdate.refreshToken = updateUserDto.refreshToken;
        }

        const updatedUser = await this.repository.updateUser({
            data: userToUpdate,
            where: { email: userToUpdate.email },
        });

        const returnUser: FoundUserDto = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            accessLevel: updatedUser.accessLevel,
        };

        return returnUser;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const foundUser = await this.repository.getUsers({ where: { email } });

        return foundUser.length ? foundUser[0] : null;
    }
}
