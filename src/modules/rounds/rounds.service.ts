import { RoundsRepository } from './rounds.repository';
import { CreateRoundDto } from './dtos/CreateRoundDto';
import { Injectable } from '@nestjs/common';
import { Bid, Round } from '@prisma/client';

@Injectable()
export class RoundsService {
    constructor(private repository: RoundsRepository) {}

    async createRound(roundDto: CreateRoundDto, auctionId: string) {
        const newRound = {
            sequenceNumber: roundDto.sequenceNumber,
        };

        const createdUser = await this.repository.createRound({
            data: newRound,
            auctionId,
        });

        return createdUser;
    }

    async updateRoundsWithBids(rounds: Array<Round & { Bids: Bid[] }>) {
        await this.repository.updateRoundsWithBids({ data: rounds });
    }
}
