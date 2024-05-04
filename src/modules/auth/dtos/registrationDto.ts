import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegistrationDto {
    @IsString()
    @MaxLength(200)
    @MinLength(2)
    name: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MaxLength(50)
    @MinLength(8)
    password: string;
}
