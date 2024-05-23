import { RoundsRepository } from './rounds.repository';
import { CreateRoundDto } from './dtos/CreateRoundDto';
import { Injectable } from '@nestjs/common';
import { Bid, Pseudonym, Round, User } from '@prisma/client';

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

    async updateRoundsWithBids(
        rounds: Array<Round & { Bids: Array<Bid & { User?: User & { Pseudonym: Pseudonym[] } }> }>,
    ) {
        await this.repository.updateRoundsWithBids({ data: rounds });
    }

    async getDeepRoundsByAuction(auctionId: string) {
        return this.repository.findAllWithBidsAndUsers({ auctionId });
    }
}
