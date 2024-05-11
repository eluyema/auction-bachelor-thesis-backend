import { AuctionType } from '@prisma/client';
import {
    IsDateString,
    IsIn,
    IsJSON,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateAuctionDto {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    @IsIn([AuctionType.DEFAULT, AuctionType.ESCO, AuctionType.NON_PRICE_CRITERIA])
    auctionType?: AuctionType;

    @IsOptional()
    @IsJSON()
    auctionOptions?: string;

    @IsOptional()
    @IsString()
    purchaseCode: string;

    @IsOptional()
    @IsString()
    customerName: string;

    @IsOptional()
    @IsNumber()
    expectedCost: number;

    @IsOptional()
    @IsNumber()
    decreaseStep: number;

    @IsOptional()
    @IsDateString()
    auctionStartAt: string;

    @IsOptional()
    @IsDateString()
    firstRoundStartAt: string;

    @IsOptional()
    @IsNumber()
    timeForRoundInSecs: number;
}
