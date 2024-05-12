import { HttpException, HttpStatus } from '@nestjs/common';
import { Auction, Bid, Round } from '@prisma/client';
import { randomUUID } from 'crypto';
import { CreateInitialBidDto } from '../dtos/CreateInitialBidDto';
import { AuctionStrategy } from './auction-strategy';

export class DefaultAuctionStrategy implements AuctionStrategy {
    constructor(private auction: Auction & { Rounds: Array<Round & { Bids: Bid[] }> }) {}

    private getUserOrderForRound(initRoundWithBids: Round & { Bids: Bid[] }) {
        const bids = initRoundWithBids.Bids || [];

        bids.sort((bidA, bidB) => {
            if (bidA.total !== bidB.total) {
                return Number(bidB.total) - Number(bidA.total); // the less money will be last
            }

            return bidB.totalUpdatedAt.getTime() - bidA.totalUpdatedAt.getTime(); // the fisrt time will be first
        });

        return bids.map(({ userId }) => ({ userId }));
    }

    private getRawRoundsWithoutSelectedUser(
        roundsWithBids: Array<Round & { Bids: Bid[] }>,
        userId: string,
    ) {
        return roundsWithBids.map((round) => {
            const updatedBids = round.Bids.filter((bid) => bid.userId !== userId);

            return { ...round, Bids: updatedBids };
        });
    }

    private getRawRoundsWithNewInititalBid(
        roundsWithBids: Array<Round & { Bids: Bid[] }>,
        newBidDto: CreateInitialBidDto,
        userId: string,
    ) {
        return roundsWithBids.map((round) => {
            const dateNow = new Date();

            const total = round.sequenceNumber === 0 ? BigInt(newBidDto.total) : null;
            const totalUpdatedAt = round.sequenceNumber === 0 ? dateNow : null;

            const bids = round.Bids;

            const newBid: Bid = {
                id: randomUUID(),
                sequenceNumber: 0,
                startAt: dateNow,
                endAt: dateNow,
                bidOptions: null,
                totalUpdatedAt,
                total,
                userId: userId,
                roundId: round.id,
            };

            return { ...round, Bids: [...bids, newBid] };
        });
    }

    private getRoundsWithSortedBids(
        roundsWithBids: Array<Round & { Bids: Bid[] }>,
        usersOrder: { userId: string }[],
        firstRoundStartAt: Date,
        secondsForRound: number,
    ): Array<Round & { Bids: Bid[] }> {
        const currentDate = new Date(firstRoundStartAt);
        const updatedRounds: Array<Round & { Bids: Bid[] }> = [];

        for (let i = 0; i < roundsWithBids.length; i++) {
            const round = roundsWithBids.find(({ sequenceNumber }) => sequenceNumber === i);
            const bids = round.Bids;

            const sortedBids: Bid[] = [];

            for (let j = 0; j < usersOrder.length; j++) {
                const bid = bids.find(({ userId }) => userId === usersOrder[j].userId);

                if (i === 0) {
                    const smallestDate = new Date(0);

                    sortedBids.push({
                        ...bid,
                        sequenceNumber: j,
                        startAt: smallestDate,
                        endAt: smallestDate,
                    });
                    continue;
                }

                const startAt = new Date(currentDate);

                currentDate.setSeconds(startAt.getSeconds() + secondsForRound);

                const endAt = new Date(currentDate);

                sortedBids.push({ ...bid, sequenceNumber: j, startAt, endAt });
            }

            const updatedRound: Round & { Bids: Bid[] } = { ...round, Bids: sortedBids };

            updatedRounds.push(updatedRound);
        }
        return updatedRounds;
    }

    async createInititalBid(dto: CreateInitialBidDto, userId: string) {
        const rounds = this.auction.Rounds;

        const { firstRoundStartAt, timeForRoundInSecs } = this.auction;

        if (rounds.length < 4) {
            throw new HttpException(
                'Кількість раундів не коректна',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const isUserAlreadyBidded = rounds[0].Bids.some((bid) => userId === bid.userId);

        if (isUserAlreadyBidded) {
            throw new HttpException(
                'This user(' + userId + ') already bidded',
                HttpStatus.BAD_REQUEST,
            );
        }

        const roundsWithUnsortedBids = this.getRawRoundsWithNewInititalBid(rounds, dto, userId);

        const initRound = roundsWithUnsortedBids.find(({ sequenceNumber }) => sequenceNumber === 0);

        if (!initRound) {
            throw new HttpException('Раунд з заявками відсутній', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const usersOrder = this.getUserOrderForRound(initRound);

        const updatedRounds = this.getRoundsWithSortedBids(
            roundsWithUnsortedBids,
            usersOrder,
            firstRoundStartAt,
            Number(timeForRoundInSecs),
        );

        return updatedRounds;
    }

    async removeUserFromRounds(userId: string) {
        const rounds = this.auction.Rounds;

        const { firstRoundStartAt, timeForRoundInSecs } = this.auction;

        if (rounds.length < 4) {
            throw new HttpException(
                'Кількість раундів не коректна',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const isUserAlreadyBidded = rounds[0].Bids.some((bid) => userId === bid.userId);

        if (!isUserAlreadyBidded) {
            throw new HttpException(
                'This user(' + userId + ") didn't bid yet",
                HttpStatus.BAD_REQUEST,
            );
        }

        const roundsWithUnsortedBids = this.getRawRoundsWithoutSelectedUser(rounds, userId);

        const initRound = roundsWithUnsortedBids.find(({ sequenceNumber }) => sequenceNumber === 0);

        if (!initRound) {
            throw new HttpException('Раунд з заявками відсутній', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const usersOrder = this.getUserOrderForRound(initRound);

        const updatedRounds = this.getRoundsWithSortedBids(
            roundsWithUnsortedBids,
            usersOrder,
            firstRoundStartAt,
            Number(timeForRoundInSecs),
        );

        return updatedRounds;
    }
}
