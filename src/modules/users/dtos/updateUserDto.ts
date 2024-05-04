import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AccessLevelType } from '../users.entity';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(200)
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    @MinLength(1)
    accessLevel: AccessLevelType;
}
