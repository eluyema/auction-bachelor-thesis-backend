import { Injectable } from '@nestjs/common';
import { Bid, Prisma, Round, User } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class RoundsRepository {
    constructor(private prisma: PrismaService) {}

    async createRound(params: {
        data: Omit<Prisma.RoundCreateInput, 'Auction'>;
        auctionId: string;
    }): Promise<Round> {
        const { data, auctionId } = params;

        const newRoundData: Prisma.RoundCreateInput = {
            ...data,
            Auction: {
                connect: {
                    id: auctionId,
                },
            },
        };

        return this.prisma.round.create({ data: newRoundData });
    }

    async createManyRounds(params: { data: Prisma.RoundCreateManyInput[] }) {
        const { data } = params;

        return this.prisma.round.createMany({ data });
    }

    async updateRoundsWithBids(params: {
        data: Array<Round & { Bids: Array<Bid & { User?: User }> }>;
    }) {
        const { data } = params;
        const queries = [];
        const bidIds = [];
        for (const round of data) {
            bidIds.push(...round.Bids.map(({ id }) => id));
        }

        queries.push(
            this.prisma.bid.deleteMany({
                where: {
                    id: {
                        in: bidIds,
                    },
                },
            }),
        );
        const newBids: Prisma.BidCreateManyInput[] = [];
        for (const round of data) {
            newBids.push(
                ...round.Bids.map((bid) => {
                    return {
                        id: bid.id,
                        roundId: bid.roundId,
                        total: bid.total,
                        totalUpdatedAt: bid.totalUpdatedAt,
                        coefficient: bid.coefficient,
                        adjustedPrice: bid.adjustedPrice,
                        years: bid.years,
                        days: bid.years,
                        percent: bid.percent,
                        sequenceNumber: bid.sequenceNumber,
                        startAt: bid.startAt,
                        endAt: bid.endAt,
                        userId: bid.userId,
                    };
                }),
            );
        }

        queries.push(
            this.prisma.bid.createMany({
                data: newBids,
            }),
        );

        return this.prisma.$transaction(queries);
    }

    async findAll(params: { auctionId: string }) {
        return this.prisma.round.findMany({ where: params });
    }

    async findAllWithBidsAndUsers(params: { auctionId: string }) {
        return this.prisma.round.findMany({
            where: {
                auctionId: params.auctionId,
            },
            include: {
                Bids: {
                    include: {
                        User: true,
                    },
                },
            },
        });
    }
}
