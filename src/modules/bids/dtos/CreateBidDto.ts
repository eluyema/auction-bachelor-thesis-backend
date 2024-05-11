export class CreateBidDto {
    userId: string;
    total: number;
    startAt: string;
    sequenceNumber: number;
    bidOptions?: string;
    endAt: string;
    totalUpdatedAt?: string;
    roundId: string;
}
