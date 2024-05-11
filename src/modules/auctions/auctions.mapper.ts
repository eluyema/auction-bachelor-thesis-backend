import { Auction, Bid, Round, User } from '@prisma/client';
import { RoundsMapper } from '../rounds/rounds.mapper';

export class AuctionsMapper {
    public static mapToPublicView(
        auction: Auction & { Rounds: Array<Round & { Bids: Array<Bid & { User: User }> }> },
        currentDate: Date,
    ) {
        const mappedRounds = RoundsMapper.toPublicRounds(
            auction.Rounds,
            auction.auctionStartAt,
            auction.firstRoundStartAt,
            currentDate,
        );
        return { ...auction, Rounds: mappedRounds };
    }
}
