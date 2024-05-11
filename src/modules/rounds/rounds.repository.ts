import { Injectable } from '@nestjs/common';
import { Bid, Prisma, Round } from '@prisma/client';
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

    async updateRoundsWithBids(params: { data: Array<Round & { Bids: Bid[] }> }) {
        const { data } = params;
        const queries = [];

        for (const round of data) {
            queries.push(this.prisma.bid.deleteMany({ where: { roundId: round.id } }));
        }

        for (const round of data) {
            queries.push(
                this.prisma.bid.createMany({
                    data: round.Bids,
                }),
            );
        }

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
