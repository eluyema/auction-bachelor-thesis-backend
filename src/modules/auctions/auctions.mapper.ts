import { Auction, Bid, Pseudonym, Round, User } from '@prisma/client';
import { RoundsMapper } from '../rounds/rounds.mapper';

export class AuctionsMapper {
    public static mapToPublicView(
        auction: Auction & {
            Rounds: Array<
                Round & { Bids: Array<Bid & { User: User & { Pseudonym: Pseudonym[] } }> }
            >;
        },
        currentDate: Date,
    ) {
        const mappedRounds = RoundsMapper.toPublicRounds(
            auction.Rounds,
            auction.auctionStartAt,
            auction.firstRoundStartAt,
            currentDate,
            auction.auctionType,
        );

        const auctionStatus = AuctionsMapper.getAuctionStatus(auction, currentDate);

        return { ...auction, auctionStatus, Rounds: mappedRounds };
    }

    public static mapToAdminView(
        auction: Auction & {
            Rounds: Array<
                Round & { Bids: Array<Bid & { User: User & { Pseudonym: Pseudonym[] } }> }
            >;
        },
        currentDate: Date,
    ) {
        const mappedRounds = RoundsMapper.toAdminRounds(auction.Rounds, auction.firstRoundStartAt);

        const auctionStatus = AuctionsMapper.getAuctionStatus(auction, currentDate);

        return { ...auction, auctionStatus, Rounds: mappedRounds };
    }

    public static mapToPublicViewWithoutRounds(
        auction: Auction & { Rounds: Array<Round & { Bids: Array<Bid & { User?: User }> }> },
        currentDate: Date,
    ) {
        const auctionStatus = AuctionsMapper.getAuctionStatus(auction, currentDate);

        return { ...auction, auctionStatus, Rounds: undefined };
    }

    public static getAuctionStatus(
        auction: Auction & { Rounds: Array<Round & { Bids: Array<Bid> }> },
        currentDate: Date,
    ): 'waiting' | 'active' | 'finished' {
        const lastBid = RoundsMapper.getLastBidOfRounds(auction.Rounds);

        if (auction.auctionStartAt > currentDate) {
            return 'waiting';
        }

        if (!lastBid) {
            return 'finished';
        }

        if (currentDate < lastBid.endAt) {
            return 'active';
        }

        return 'finished';
    }
}
