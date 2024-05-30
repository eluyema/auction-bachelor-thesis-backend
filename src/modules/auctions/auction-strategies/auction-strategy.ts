import { Bid, Pseudonym, Round, User } from '@prisma/client';
import { MakeBidDto } from '../dtos/MakeBidDto';

export interface AuctionStrategy {
    createInititalBid(data: unknown, userId: string): Promise<Array<Round & { Bids: Bid[] }>>;

    removeUserFromRounds(userId: string): Promise<Array<Round & { Bids: Bid[] }>>;

    makeBid(
        dto: MakeBidDto,
        userId: string,
        currentTime: Date,
    ): Promise<Array<Round & { Bids: Array<Bid & { User?: User & { Pseudonym: Pseudonym[] } }> }>>;
}
