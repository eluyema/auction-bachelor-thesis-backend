import { Injectable } from '@nestjs/common';
import { PseudonymsRepository } from './pseudonyms.repository';

@Injectable()
export class PseudonymsService {
    constructor(private repository: PseudonymsRepository) {}

    async makeNewOrderOfAuctionPseodonyms(auctionId: string, newUserIdsOrder: string[]) {
        const newPseudonyms = newUserIdsOrder.map((userId, ix) => ({
            userId,
            value: 'Учасник ' + (ix + 1),
        }));

        return this.repository.updateAuctionPseudonyms({ auctionId, newPseudonyms });
    }

    async getPseudonymsOfAuction(auctionId: string) {
        return this.repository.findAll({ auctionId });
    }
}
