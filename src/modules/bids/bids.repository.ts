import { Injectable } from '@nestjs/common';
import { Bid, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class BidsRepository {
    constructor(private prisma: PrismaService) {}

    async createBid(params: {
        data: Omit<Prisma.BidCreateInput, 'User' | 'Round'>;
        roundId: string;
        userId: string;
    }): Promise<Bid> {
        const { data, roundId, userId } = params;

        const newBidData: Prisma.BidCreateInput = {
            total: data.total,
            startAt: data.startAt,
            endAt: data.endAt,
            sequenceNumber: data.sequenceNumber,
            Round: {
                connect: {
                    id: roundId,
                },
            },
            User: {
                connect: {
                    id: userId,
                },
            },
        };

        return this.prisma.bid.create({ data: newBidData });
    }

    async findAll(params: { roundId: string }) {
        return this.prisma.bid.findMany({ where: params });
    }

    async createManyBids(params: { arrData: Prisma.BidCreateManyInput[] }) {
        const { arrData } = params;
        const preparedData = arrData.map(
            (data: Omit<Prisma.BidCreateManyInput, 'User' | 'Round'>) => {
                const newBidData: Prisma.BidCreateManyInput = {
                    total: data.total,
                    startAt: data.startAt,
                    endAt: data.endAt,
                    bidOptions: data.bidOptions,
                    sequenceNumber: data.sequenceNumber,
                    roundId: data.roundId,
                    userId: data.userId,
                    totalUpdatedAt: data.totalUpdatedAt,
                };

                return newBidData;
            },
        );

        return this.prisma.bid.createMany({ data: preparedData });
    }

    async removeBid(params: { bidId: string }) {
        return this.prisma.bid.delete({ where: { id: params.bidId } });
    }

    async updateBid(data: Prisma.BidUpdateInput, bidId: string) {
        return this.prisma.bid.update({ data, where: { id: bidId } });
    }

    async updateCurrentBids(
        data: Prisma.BidUpdateInput,
        params: { userId: string; currentDate: Date; auctionId: string },
    ) {
        const { currentDate, auctionId, userId } = params;

        return this.prisma.bid.updateMany({
            data,
            where: {
                AND: {
                    startAt: {
                        lte: currentDate,
                    },
                    endAt: {
                        gte: currentDate,
                    },
                    userId,
                },
                Round: {
                    auctionId: auctionId,
                },
            },
        });
    }

    async getInitialBids(auctionId: string) {
        return this.prisma.bid.findMany({
            where: {
                Round: {
                    sequenceNumber: 0,
                    auctionId,
                },
            },
        });
    }
}
