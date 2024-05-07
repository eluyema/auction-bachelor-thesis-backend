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

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @AccessLevels(AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Get('/email/:email')
    async findByEmail(@Param('email') email) {
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

        return { result: preparedUser };
    }

    @AccessLevels(AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Put('/email/:email')
    async updateUser(@Body() dto: UpdateUserDto, @Param('email') email) {
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

        return { result: preparedUser };
    }

    @AccessLevels(AccessLevel.REGULAR, AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Get('/self')
    async getSelfUser(@Request() req: AuthRequest) {
        const user = req.user;
        return { result: user };
    }
}
