import { Injectable } from '@nestjs/common';
import { Auction, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { CreateRoundDto } from '../rounds/dtos/CreateRoundDto';

@Injectable()
export class AuctionsRepository {
    constructor(private prisma: PrismaService) {}

    async createAuction(params: {
        data: Omit<Prisma.AuctionCreateInput, 'Author'>;
        roundsData: CreateRoundDto[];
        authorId: string;
    }): Promise<Auction> {
        const { data, roundsData, authorId } = params;

        const newAuctionData: Prisma.AuctionCreateInput = {
            ...data,
            Rounds: {
                createMany: {
                    data: roundsData,
                },
            },
            Author: {
                connect: { id: authorId },
            },
        };

        return this.prisma.auction.create({ data: newAuctionData });
    }

    async updateAuction(params: {
        data: Prisma.AuctionUpdateInput;
        auctionId: string;
    }): Promise<Auction> {
        const { data, auctionId } = params;

        return this.prisma.auction.update({ data: data, where: { id: auctionId } });
    }

    async findAll(params: {
        select?: Prisma.AuctionSelect;
        where?: Prisma.AuctionWhereInput;
        include?: Prisma.AuctionInclude;
    }) {
        const { where, include } = params;
        return this.prisma.auction.findMany({
            where,
            include,
        });
    }

    async findFirst(params: { id?: string; authorId?: string }, include?: Prisma.AuctionInclude) {
        return this.prisma.auction.findFirst({
            where: params,
            include,
        });
    }

    async findAuctionWithRoundsAndBids(params: { auctionId: string }) {
        const { auctionId } = params;

        return this.prisma.auction.findFirst({
            where: { id: auctionId },
            include: {
                Rounds: {
                    include: {
                        Bids: true,
                    },
                },
            },
        });
    }

    async findManyAuctionsWithRoundsAndBids(params: { where?: Prisma.AuctionWhereInput } = {}) {
        const { where } = params;
        const auctions = await this.prisma.auction.findMany({
            where,
            include: {
                Rounds: {
                    include: {
                        Bids: true,
                    },
                },
            },
        });

        return auctions;
    }

    async findAuctionWithRoundsBidsUsers(params: { auctionId: string }) {
        const { auctionId } = params;

        return this.prisma.auction.findFirst({
            where: { id: auctionId },
            include: {
                Rounds: {
                    include: {
                        Bids: {
                            include: {
                                User: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async removeAuctions(params: Prisma.AuctionWhereInput) {
        return this.prisma.auction.deleteMany({ where: params });
    }
}
