import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BidsRepository } from './bids.repository';
import { CreateBidDto } from './dtos/CreateBidDto';
import { UpdateBidDto } from './dtos/UpdateBidDto';

@Injectable()
export class BidsService {
    constructor(private repository: BidsRepository) {}

    async createBid(dto: CreateBidDto) {
        const { userId, roundId, total, sequenceNumber, startAt, endAt, totalUpdatedAt } = dto;

        const createdBid = await this.repository.createBid({
            data: {
                total,
                startAt,
                sequenceNumber,
                endAt,
                totalUpdatedAt,
            },
            roundId,
            userId,
        });

        return createdBid;
    }

    async createManyBids(dtos: CreateBidDto[]) {
        const createdBids = await this.repository.createManyBids({
            arrData: dtos,
        });

        return createdBids;
    }

    async updateBid(dto: UpdateBidDto, bidId: string) {
        const updatedBid = await this.repository.updateBid(dto, bidId);

        return updatedBid;
    }

    async updateCurrentBid(dto: UpdateBidDto, auctionId: string, userId: string) {
        const currentDate = new Date();

        const { count } = await this.repository.updateCurrentBids(dto, {
            auctionId,
            userId,
            currentDate,
        });

        if (count === 0) {
            throw new HttpException('Зараз не ваш хід', HttpStatus.BAD_REQUEST);
        }
    }

    async removeBid(bidId: string) {
        const removedBid = await this.repository.removeBid({ bidId });

        return removedBid;
    }
}
