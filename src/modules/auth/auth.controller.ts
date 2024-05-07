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

        return { message: 'Success registered' };
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Body() dto: RefreshDto) {
        return this.authService.refresh(dto.refreshToken);
    }
}
