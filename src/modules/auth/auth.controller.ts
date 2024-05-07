import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dtos/registrationDto';
import { LoginDto } from './dtos/loginDto';
import { RefreshDto } from './dtos/refreshDto';
import { ResponseBody } from 'src/entities/framework/ResponseBody';
import { createResponseBody } from 'src/utils/createResponse';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('registration')
    @HttpCode(201)
    async registration(@Body() dto: RegistrationDto): Promise<ResponseBody> {
        await this.authService.registration(dto);

        return createResponseBody({ message: 'Success registered' });
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto): Promise<ResponseBody> {
        const data = await this.authService.login(dto);

        return createResponseBody(data);
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Body() dto: RefreshDto): Promise<ResponseBody> {
        const data = await this.authService.refresh(dto.refreshToken);

        return createResponseBody(data);
    }
}
