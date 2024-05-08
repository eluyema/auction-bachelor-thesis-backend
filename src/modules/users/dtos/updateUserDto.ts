import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { AccessLevel, AccessLevelType } from '../users.entity';

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
    @IsIn(Object.keys(AccessLevel))
    accessLevel: AccessLevelType;
}
