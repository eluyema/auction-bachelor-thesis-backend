import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PseudonymsRepository {
    constructor(private prisma: PrismaService) {}

    async updateAuctionPseudonyms(params: {
        auctionId: string;
        newPseudonyms: Array<{
            userId: string;
            value: string;
        }>;
    }) {
        const { newPseudonyms: newPseodonymsRaw, auctionId } = params;

        const queries = [this.prisma.pseudonym.deleteMany({ where: { auctionId } })];

        if (newPseodonymsRaw.length) {
            const newPseudonyms: Prisma.PseudonymCreateManyInput[] = newPseodonymsRaw.map(
                (pseudonymRaw) => ({
                    ...pseudonymRaw,
                    auctionId,
                }),
            );

            queries.push(this.prisma.pseudonym.createMany({ data: newPseudonyms }));
        }

        return this.prisma.$transaction(queries);
    }

    async findAll(params: { auctionId: string }) {
        return this.prisma.pseudonym.findMany({ where: params });
    }
}
