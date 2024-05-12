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
            : firstRoundStartAt;

        if (currentDate > lastBidEndAt) {
            const preparedRounds = rounds.map((round) => {
                const firstBid = RoundsMapper.getFirstBid([round]);
                const lastBid = RoundsMapper.getLastBid([round]);

                const roundTimeData = {
                    startAt: firstBid ? firstBid.startAt : firstRoundStartAt,
                    endAt: lastBid ? lastBid.endAt : firstRoundStartAt,
                };

                const preparedBids = round.Bids.map((bid) => {
                    const preparedUser: FoundUserDto = {
                        id: bid.User.id,
                        name: bid.User.name,
                        email: bid.User.email,
                        accessLevel: bid.User.accessLevel,
                    };

                    return {
                        ...bid,
                        total: bid.total ? bid.total : this.getLastBidTotal(rounds, bid.userId),
                        User: preparedUser,
                        userId: bid.userId,
                    };
                });

                return { ...round, ...roundTimeData, Bids: preparedBids };
            });

            return preparedRounds;
        }

        const preparedRounds = rounds.map((round) => {
            const firstBid = RoundsMapper.getFirstBid([round]);
            const lastBid = RoundsMapper.getLastBid([round]);

            const roundTimeData = {
                startAt: firstBid ? firstBid.startAt : firstRoundStartAt,
                endAt: lastBid ? lastBid.endAt : firstRoundStartAt,
            };

            const preparedBids = round.Bids.map((bid) => {
                return {
                    ...bid,
                    total: bid.total ? bid.total : this.getLastBidTotal(rounds, bid.userId),
                    User: null,
                    userId: undefined,
                };
            });

            return { ...round, ...roundTimeData, Bids: preparedBids };
        });

        return preparedRounds;
    }

    private static getLastBidTotal(
        rounds: Array<Round & { Bids: Array<Bid & { User?: User }> }>,
        userId: string,
    ) {
        if (!rounds.length) {
            return 0;
        }

        const userBids = rounds
            .map((round) => round.Bids.filter((bid) => bid.userId === userId))
            .flat();

        let lastBid = userBids[0];
        let lastUpdateAt = userBids[0].totalUpdatedAt;

        for (const bid of userBids) {
            if (bid.totalUpdatedAt === null) {
                continue;
            }
            if (lastUpdateAt < bid.totalUpdatedAt) {
                lastUpdateAt = bid.totalUpdatedAt;
                lastBid = bid;
            }
        }

        return lastBid.total || 0;
    }

    public static toAdminRounds(
        rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>,
        firstRoundStartAt: Date,
    ) {
        const preparedRounds = rounds.map((round) => {
            const firstBid = RoundsMapper.getFirstBid([round]);
            const lastBid = RoundsMapper.getLastBid([round]);

            const roundTimeData = {
                startAt: firstBid ? firstBid.startAt : firstRoundStartAt,
                endAt: lastBid ? lastBid.endAt : firstRoundStartAt,
            };

            const preparedBids = round.Bids.map((bid) => {
                const preparedUser: FoundUserDto = {
                    id: bid.User.id,
                    name: bid.User.name,
                    email: bid.User.email,
                    accessLevel: bid.User.accessLevel,
                };
                return {
                    ...bid,
                    total: bid.total ? bid.total : this.getLastBidTotal(rounds, bid.userId),
                    User: preparedUser,
                };
            });

            return { ...round, ...roundTimeData, Bids: preparedBids };
        });

        return preparedRounds;
    }

    static getFirstBid(rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>) {
        const allBids = rounds.map((round) => round.Bids).flat();

        if (!allBids.length) {
            return null;
        }

        const sortedBids = allBids.sort(
            (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
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
            (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        );

        const lastBid = sortedBids[sortedBids.length - 1];

        return lastBid;
    }
}
