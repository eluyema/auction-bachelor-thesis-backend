import { IsNumber, IsOptional } from 'class-validator';

export class MakeBidDto {
    @IsOptional()
    @IsNumber()
    total?: number;

    @IsOptional()
    @IsNumber()
    years?: number;

    @IsOptional()
    @IsNumber()
    days?: number;

    @IsOptional()
    @IsNumber()
    percent?: number;
}
