export class UpdateBidDto {
    userId?: string;
    total?: number;
    sequenceNumber?: number;
    bidOptions?: string;
    startAt?: string;
    endAt?: string;
    totalUpdatedAt?: string | Date;
    roundId?: string;
}
