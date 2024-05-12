import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    Put,
    Request,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FoundUserDto } from './dtos/foundUserDto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccessLevels } from '../auth/access-levels.decorator';
import { AccessLevelGuard } from '../auth/access-level.guard';
import { AccessLevel } from './users.entity';
import { UpdateUserDto } from './dtos/updateUserDto';
import { AuthRequest } from 'src/entities/framework/AuthRequest';
import { ResponseBody } from 'src/entities/framework/ResponseBody';
import { createResponseBody } from 'src/utils/createResponse';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @AccessLevels(AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Get('/email/:email')
    async findByEmail(@Param('email') email): Promise<ResponseBody> {
        const user = await this.usersService.findUserByEmail(email);

        if (user === null) {
            throw new NotFoundException(`User with email ${email} doesn't exist`);
        }

        const preparedUser: FoundUserDto = {
            id: user.id,
            name: user.name,
            email: user.email,
            accessLevel: user.accessLevel,
        };

        return createResponseBody(preparedUser);
    }

    @AccessLevels(AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Put('/email/:email')
    async updateUser(@Body() dto: UpdateUserDto, @Param('email') email): Promise<ResponseBody> {
        const user = await this.usersService.updateUser(email, dto);

        if (user === null) {
            throw new NotFoundException(`User with email ${email} doesn't exist`);
        }

        const preparedUser: FoundUserDto = {
            id: user.id,
            name: user.name,
            email: user.email,
            accessLevel: user.accessLevel,
        };

        return createResponseBody(preparedUser);
    }

    @AccessLevels(AccessLevel.REGULAR, AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Get('/self')
    async getSelfUser(@Request() req: AuthRequest) {
        const userData = req.user;

        const foundUser = await this.usersService.findUserByEmail(userData.email);

        if (foundUser === null) {
            throw new NotFoundException(`User with email ${userData.email} doesn't exist`);
        }

        const preparedUser: FoundUserDto = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            accessLevel: foundUser.accessLevel,
        };

        return createResponseBody(preparedUser);
    }
}
