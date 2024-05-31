import { AuctionType, Bid, Pseudonym, Round, User } from '@prisma/client';
import { FoundUserDto } from '../users/dtos/foundUserDto';

export class RoundsMapper {
    public static toPublicRounds(
        rounds: Array<Round & { Bids: Array<Bid & { User: User & { Pseudonym: Pseudonym[] } }> }>,
        auctionStartAt: Date,
        firstRoundStartAt: Date,
        currentDate: Date,
        auctionType: AuctionType,
    ) {
        if (currentDate < auctionStartAt) {
            return [];
        }

        const lastBid = RoundsMapper.getLastBidOfRounds(rounds);

        if (!lastBid) {
            return [];
        }

        const lastBidEndAt = lastBid.endAt;

        if (currentDate > lastBidEndAt) {
            const preparedRounds = rounds.map((round) => {
                const firstBid = RoundsMapper.getFirstBidOfRound(round);
                const lastBid = RoundsMapper.getLastBidOfRound(round);

                const roundTimeData = {
                    startAt: firstBid ? firstBid.startAt : firstRoundStartAt,
                    endAt: lastBid ? lastBid.endAt : firstRoundStartAt,
                };

                const preparedBids = round.Bids.map((bid) => {
                    const Pseudonym = bid.User.Pseudonym[0];

                    const lastBidWithTotal = this.getLastBidWithFilledTotal(
                        rounds,
                        bid.userId,
                        round.sequenceNumber,
                    );

                    const total = bid.total ? bid.total : lastBidWithTotal.total || 0;

                    const adjustedPrice = bid.adjustedPrice
                        ? bid.adjustedPrice
                        : lastBidWithTotal.adjustedPrice || 0;

                    const years = bid.years ? bid.years : lastBidWithTotal.years || 0;

                    const days = bid.days ? bid.days : lastBidWithTotal.days || 0;

                    const percent = bid.percent ? bid.percent : lastBidWithTotal.percent || 0;

                    const preparedUser: FoundUserDto = {
                        id: bid.User.id,
                        name: bid.User.name,
                        email: bid.User.email,
                        accessLevel: bid.User.accessLevel,
                    };

                    return {
                        ...bid,
                        total,
                        adjustedPrice,
                        years,
                        days,
                        percent,
                        pseudonym: Pseudonym ? Pseudonym.value : null,
                        User: preparedUser,
                        userId: bid.userId,
                    };
                });

                return { ...round, ...roundTimeData, Bids: preparedBids };
            });

            return preparedRounds;
        }

        const preparedRounds = rounds.map((round) => {
            const firstBid = RoundsMapper.getFirstBidOfRound(round);
            const lastBid = RoundsMapper.getLastBidOfRound(round);

            const roundTimeData = {
                startAt: firstBid ? firstBid.startAt : firstRoundStartAt,
                endAt: lastBid ? lastBid.endAt : firstRoundStartAt,
            };

            const preparedBids = round.Bids.map((bid) => {
                const Pseudonym = bid.User.Pseudonym[0];

                const lastBidWithTotal = this.getLastBidWithFilledTotal(
                    rounds,
                    bid.userId,
                    round.sequenceNumber,
                );

                const total = bid.total ? bid.total : lastBidWithTotal.total || 0;
                const adjustedPrice = bid.adjustedPrice
                    ? bid.adjustedPrice
                    : lastBidWithTotal.adjustedPrice || 0;

                return {
                    ...bid,
                    total: auctionType === AuctionType.NON_PRICE_CRITERIA ? null : total,
                    adjustedPrice,
                    pseudonym: Pseudonym ? Pseudonym.value : null,
                    User: null,
                    userId: undefined,
                    years: null,
                    days: null,
                    percent: null,
                    coefficient: null,
                };
            });

            return { ...round, ...roundTimeData, Bids: preparedBids };
        });

        return preparedRounds;
    }

    static getLastBidWithFilledTotal(
        rounds: Array<Round & { Bids: Array<Bid & { User?: User }> }>,
        userId: string,
        currentSequenceNumber: number,
    ) {
        if (!rounds.length) {
            return null;
        }

        const userBids = rounds
            .filter((round) => round.sequenceNumber <= currentSequenceNumber)
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

        return lastBid || null;
    }

    public static toFilledRounds(
        rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>,
    ): Array<Round & { Bids: Array<Bid & { User: User }> }> {
        return rounds.map((round) => {
            const Bids = round.Bids.map((bid): Bid & { User: User } => {
                const lastBidWithTotal = this.getLastBidWithFilledTotal(
                    rounds,
                    bid.userId,
                    round.sequenceNumber,
                );

                const total = bid.total ? bid.total : lastBidWithTotal.total || 0;
                const adjustedPrice = bid.adjustedPrice
                    ? bid.adjustedPrice
                    : lastBidWithTotal.adjustedPrice || 0;
                const years = bid.years ? bid.years : lastBidWithTotal.years || 0;
                const days = bid.days ? bid.days : lastBidWithTotal.days || 0;
                const percent = bid.percent ? bid.percent : lastBidWithTotal.percent || 0;
                return {
                    ...bid,
                    total: BigInt(total),
                    adjustedPrice: BigInt(adjustedPrice),
                    years,
                    days,
                    percent,
                };
            });
            return { ...round, Bids };
        });
    }

    public static toAdminRounds(
        rounds: Array<Round & { Bids: Array<Bid & { User: User & { Pseudonym: Pseudonym[] } }> }>,
        firstRoundStartAt: Date,
    ) {
        const preparedRounds = rounds.map((round) => {
            const firstBid = RoundsMapper.getFirstBidOfRound(round);
            const lastBid = RoundsMapper.getLastBidOfRound(round);

            const roundTimeData = {
                startAt: firstBid ? firstBid.startAt : firstRoundStartAt,
                endAt: lastBid ? lastBid.endAt : firstRoundStartAt,
            };

            const preparedBids = round.Bids.map((bid) => {
                const Pseudonym = bid.User.Pseudonym[0];

                const preparedUser: FoundUserDto = {
                    id: bid.User.id,
                    name: bid.User.name,
                    email: bid.User.email,
                    accessLevel: bid.User.accessLevel,
                };

                const lastBidWithTotal = this.getLastBidWithFilledTotal(
                    rounds,
                    bid.userId,
                    round.sequenceNumber,
                );

                const total = bid.total ? bid.total : lastBidWithTotal.total || 0;

                return {
                    ...bid,
                    total,
                    pseudonym: Pseudonym ? Pseudonym.value : null,
                    User: preparedUser,
                };
            });

            return { ...round, ...roundTimeData, Bids: preparedBids };
        });

        return preparedRounds;
    }

    static getFirstBidOfRounds(rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>) {
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

    static getLastBidOfRounds(rounds: Array<Round & { Bids: Array<Bid> }>) {
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

    static getFirstBidOfRound(round: Round & { Bids: Array<Bid> }) {
        const allBids = round.Bids;

        if (!allBids.length) {
            return null;
        }

        const sortedBids = allBids.sort(
            (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        );

        const firstBid = sortedBids[0];

        return firstBid;
    }

    static getLastBidOfRound(round: Round & { Bids: Array<Bid> }) {
        const allBids = round.Bids;

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
