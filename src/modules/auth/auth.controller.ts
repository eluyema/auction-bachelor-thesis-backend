import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dtos/registrationDto';
import { LoginDto } from './dtos/loginDto';
import { RefreshDto } from './dtos/refreshDto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('registration')
    @HttpCode(201)
    async registration(@Body() dto: RegistrationDto) {
        await this.authService.registration(dto);

        return { result: { message: 'Success registered' } };
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto) {
        const data = await this.authService.login(dto);
        return { result: data };
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Body() dto: RefreshDto) {
        const data = await this.authService.refresh(dto.refreshToken);
        return { result: data };
    }
}
