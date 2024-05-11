import { Bid, Round } from '@prisma/client';

export interface AuctionStrategy {
    createInititalBid(data: unknown, userId: string): Promise<Array<Round & { Bids: Bid[] }>>;

    removeUserFromRounds(userId: string): Promise<Array<Round & { Bids: Bid[] }>>;
}
