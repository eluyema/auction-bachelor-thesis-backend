import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MaxLength(50)
    password: string;
}
