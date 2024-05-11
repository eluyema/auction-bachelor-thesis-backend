import { IsNumber } from 'class-validator';

export class MakeBidDto {
    @IsNumber()
    total: number;
}
