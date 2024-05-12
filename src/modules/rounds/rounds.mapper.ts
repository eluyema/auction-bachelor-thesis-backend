import { Bid, Round, User } from '@prisma/client';
import { FoundUserDto } from '../users/dtos/foundUserDto';

export class RoundsMapper {
    public static toPublicRounds(
        rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>,
        auctionStartAt: Date,
        firstRoundStartAt: Date,
        currentDate: Date,
    ) {
        if (currentDate < auctionStartAt) {
            return [];
        }

        const allBidsDates = rounds
            .map((round) => {
                return round.Bids.map((bid) => bid.endAt);
            })
            .flat();

        const lastBidEndAt = allBidsDates.length
            ? allBidsDates.reduce((latestDate, currDate) =>
                  latestDate < currDate ? currDate : latestDate,
              )
            : new Date(0);

        if (currentDate > lastBidEndAt && currentDate > firstRoundStartAt) {
            const preparedRounds = rounds.map((round) => {
                const preparedBids = round.Bids.map((bid) => {
                    const preparedUser: FoundUserDto = {
                        id: bid.User.id,
                        name: bid.User.name,
                        email: bid.User.id,
                        accessLevel: bid.User.accessLevel,
                    };
                    return { id: bid.id, User: preparedUser, userId: undefined };
                });

                return { ...round, Bids: preparedBids };
            });

            return preparedRounds;
        }

        const preparedRounds = rounds.map((rounds) => {
            const preparedBids = rounds.Bids.map((bid) => {
                return { ...bid, User: null, userId: undefined };
            });

            return { ...rounds, Bids: preparedBids };
        });

        return preparedRounds;
    }

    public static toAdminRounds(rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>) {
        const preparedRounds = rounds.map((round) => {
            const preparedBids = round.Bids.map((bid) => {
                const preparedUser: FoundUserDto = {
                    id: bid.User.id,
                    name: bid.User.name,
                    email: bid.User.id,
                    accessLevel: bid.User.accessLevel,
                };
                return { id: bid.id, User: preparedUser, userId: undefined };
            });

            return { ...round, Bids: preparedBids };
        });

        return preparedRounds;
    }

    static getFirstBid(rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>) {
        const allBids = rounds.map((round) => round.Bids).flat();

        if (!allBids.length) {
            return null;
        }

        const sortedBids = allBids.sort(
            (a, b) => new Date(a.startAt).getDate() - new Date(b.startAt).getDate(),
        );

        const firstBid = sortedBids[0];

        return firstBid;
    }

    static getLastBid(rounds: Array<Round & { Bids: Array<Bid> }>) {
        const allBids = rounds.map((round) => round.Bids).flat();

        if (!allBids.length) {
            return null;
        }

        const sortedBids = allBids.sort(
            (a, b) => new Date(a.startAt).getDate() - new Date(b.startAt).getDate(),
        );

        const lastBid = sortedBids[sortedBids.length - 1];

        return lastBid;
    }
}
