import { HttpException, HttpStatus } from '@nestjs/common';
import { Auction, Bid, Round, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { CreateInitialBidDto } from '../dtos/CreateInitialBidDto';
import { AuctionStrategy } from './auction-strategy';
import { MakeBidDto } from '../dtos/MakeBidDto';
import { RoundsMapper } from 'src/modules/rounds/rounds.mapper';

export class DefaultAuctionStrategy implements AuctionStrategy {
    constructor(
        private auction: Auction & {
            Rounds: Array<Round & { Bids: Array<Bid & { User: User }> }>;
        },
    ) {}

    private getUserOrderForRound(
        initRoundWithBids: Round & {
            Bids: Array<Bid>;
        },
    ) {
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
                totalUpdatedAt,
                total,
                userId: userId,
                roundId: round.id,
                years: null,
                days: null,
                percent: null,
                coefficient: null,
                adjustedPrice: null,
            };

            return { ...round, Bids: [...bids, newBid] };
        });
    }
    //TODO: refactor
    private getRoundsWithSortedBids(
        roundsWithBids: Array<Round & { Bids: Bid[] }>,
        usersOrder: { userId: string }[],
        firstRoundStartAt: Date,
        secondsForRound: number,
    ): Array<Round & { Bids: Bid[] }> {
        const currentDate = new Date(firstRoundStartAt);
        const updatedRounds: Array<Round & { Bids: Bid[] }> = [];
        const sequenceNumbers = [...roundsWithBids.map((round) => round.sequenceNumber)].sort();
        for (const roundSequenceNumber of sequenceNumbers) {
            const round = roundsWithBids.find(
                (round) => round.sequenceNumber === roundSequenceNumber,
            );

            const bids = round.Bids;

            const sortedBids: Bid[] = [];

            for (let j = 0; j < usersOrder.length; j++) {
                const bid = bids.find(({ userId }) => userId === usersOrder[j].userId);

                if (roundSequenceNumber === 0) {
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

    async makeBid(dto: MakeBidDto, userId: string, currentTime: Date) {
        const rounds = this.auction.Rounds;
        const filledRounds = RoundsMapper.toFilledRounds(this.auction.Rounds);

        const { timeForRoundInSecs } = this.auction;

        if (rounds.length < 4) {
            throw new HttpException(
                'Кількість раундів не коректна',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        const roundsForUpdate = rounds
            .filter((round) => {
                const firstBid = RoundsMapper.getFirstBidOfRound(round);

                return currentTime < firstBid.startAt;
            })
            .map((round) => ({ ...round }));

        const currentRound = filledRounds.find((round) => {
            const firstBid = RoundsMapper.getFirstBidOfRound(round);
            const lastBid = RoundsMapper.getLastBidOfRound(round);

            return firstBid.startAt < currentTime && lastBid.endAt > currentTime;
        });

        if (!currentRound) {
            throw new HttpException('Хід для користувача не знайден', HttpStatus.FORBIDDEN);
        }

        const updatedCurrentRound = { ...currentRound };

        updatedCurrentRound.Bids = updatedCurrentRound.Bids.map((bid) => {
            if (bid.userId !== userId) {
                return bid;
            }
            return {
                ...bid,
                total: BigInt(dto.total),
                totalUpdatedAt: currentTime,
            };
        });

        if (roundsForUpdate.length === 0) {
            return [updatedCurrentRound];
        }

        const usersOrder = this.getUserOrderForRound(updatedCurrentRound);
        console.log('ORDER - ', usersOrder, usersOrder);
        console.log('USERS ORDER', updatedCurrentRound.Bids);
        const fisrtBid = RoundsMapper.getFirstBidOfRounds(roundsForUpdate);

        const updatedRounds = this.getRoundsWithSortedBids(
            roundsForUpdate,
            usersOrder,
            fisrtBid.startAt,
            Number(timeForRoundInSecs),
        );

        return [updatedCurrentRound, ...updatedRounds];
    }

    private updateBidsOrderInRounds(
        rounds: Array<Round & { Bid: Array<Bid> }>,
        usersOrder: string[],
    ) {
        for (const round of rounds) {
            for (const bid of round.Bid) {
                const sequenceNumber = usersOrder.indexOf(bid.userId);
                bid.sequenceNumber = sequenceNumber;
            }
        }
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
