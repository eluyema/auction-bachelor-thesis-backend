import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dtos/registrationDto';
import { LoginDto } from './dtos/loginDto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('registration')
    @HttpCode(201)
    async registration(@Body() dto: RegistrationDto) {
        await this.authService.registration(dto);

        return 'Success registered';
    }

    @Post('login')
    @HttpCode(200)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
