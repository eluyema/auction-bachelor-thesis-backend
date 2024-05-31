import { Auction, AuctionType, Bid, Round, User } from '@prisma/client';
import { AuctionStrategy } from './auction-strategy';
import { DefaultAuctionStrategy } from './default-auction-strategy';
import { NonPriceCriteriaAuctionStrategy } from './non-price-criteria-auction-strategy';
import { ESCOAuctionStrategy } from './esco-auction-strategy';

export class AuctionStrategyFactory {
    static getStrategyInstance(
        auction: Auction & {
            Rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>;
        },
    ): AuctionStrategy {
        if (auction.auctionType === AuctionType.NON_PRICE_CRITERIA) {
            return new NonPriceCriteriaAuctionStrategy(auction);
        } else if (auction.auctionType === AuctionType.ESCO) {
            return new ESCOAuctionStrategy(auction);
        }
        return new DefaultAuctionStrategy(auction);
    }
}
