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

export class CreateAuctionDto {
    @IsString()
    @MaxLength(500)
    @MinLength(2)
    name: string;

    @IsString()
    purchaseCode: string;

    @IsOptional()
    @IsString()
    @IsIn([AuctionType.DEFAULT, AuctionType.ESCO, AuctionType.NON_PRICE_CRITERIA])
    auctionType?: AuctionType;

    @IsOptional()
    @IsJSON()
    auctionOptions?: string;

    @IsString()
    customerName: string;

    @IsNumber()
    expectedCost: number;

    @IsNumber()
    decreaseStep: number;

    @IsDateString()
    auctionStartAt: string;

    @IsDateString()
    firstRoundStartAt: string;

    @IsNumber()
    timeForRoundInSecs: number;
}
