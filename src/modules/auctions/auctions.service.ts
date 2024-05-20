import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { AuctionsRepository } from './auctions.repository';
import { RoundsService } from '../rounds/rounds.service';
import { CreateAuctionDto } from './dtos/CreateAuctionDto';
import { UpdateAuctionDto } from './dtos/UpdateAuctionDto';
import { CreateRoundDto } from '../rounds/dtos/CreateRoundDto';
import { CreateInitialBidDto } from './dtos/CreateInitialBidDto';
import { UsersService } from '../users/users.service';
import { DefaultAuctionStrategy } from './auction-strategies/default-auction-strategy';
import { BidsService } from '../bids/bids.service';
import { MakeBidDto } from './dtos/MakeBidDto';
import { UpdateBidDto } from '../bids/dtos/UpdateBidDto';
import { AuctionsMapper } from './auctions.mapper';
import { PseudonymsService } from '../pseudonyms/pseudonyms.service';

@Injectable()
export class AuctionsService {
    constructor(
        private auctionsRepository: AuctionsRepository,
        private roundsService: RoundsService,
        private bidsService: BidsService,
        private usersService: UsersService,
        private pseudonymsService: PseudonymsService,
    ) {}

    async createAuction(auctionDto: CreateAuctionDto, authorId: string) {
        const newAuctionData = {
            ...auctionDto,
            Author: {
                connect: { id: authorId },
            },
        };

        const roundsData: CreateRoundDto[] = Array(4)
            .fill(null)
            .map((_, i) => ({ sequenceNumber: i }));

        const createdAuction = await this.auctionsRepository.createAuction({
            data: newAuctionData,
            roundsData,
            authorId,
        });

        return createdAuction;
    }

    async updateAuction(auctionDto: UpdateAuctionDto, auctionId: string) {
        const foundAuctions = await this.auctionsRepository.findAll({ where: { id: auctionId } });

        if (foundAuctions.length === 0) {
            return null;
        }

        const createdAuction = await this.auctionsRepository.updateAuction({
            data: auctionDto,
            auctionId,
        });

        return createdAuction;
    }

    async removeById(auctionId: string) {
        const { count } = await this.auctionsRepository.removeAuctions({ id: auctionId });

        if (count === 0) {
            return false;
        }

        return true;
    }

    async getAuctionsByAuthorId(authorId: string) {
        const auctions = await this.auctionsRepository.findManyAuctionsWithRoundsAndBids({
            where: { authorId },
        });

        const currentDate = new Date();

        return auctions.map((auction) => {
            return AuctionsMapper.mapToPublicViewWithoutRounds(auction, currentDate);
        });
    }

    async getParticipantAuctions(userId: string) {
        const users = await this.usersService.findUsersByIds([userId]);

        if (!users[0]) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const auctions = await this.auctionsRepository.findParticipantAuctions(userId);

        const currentDate = new Date();

        return {
            userName: users[0].name,
            auctions: auctions.map((auction) => {
                return AuctionsMapper.mapToPublicViewWithoutRounds(auction, currentDate);
            }),
        };
    }

    async getAllAuctions() {
        const auctions = await this.auctionsRepository.findManyAuctionsWithRoundsAndBids();

        const currentDate = new Date();

        return auctions.map((auction) => {
            return AuctionsMapper.mapToPublicViewWithoutRounds(auction, currentDate);
        });
    }

    async getAuctionById(auctionId: string) {
        const auctions = await this.auctionsRepository.findAll({ where: { id: auctionId } });

        if (auctions.length === 0) {
            return null;
        }

        return auctions[0];
    }

    async getFullAccessAuctionById(auctionId: string) {
        const auction = await this.auctionsRepository.findAuctionWithRoundsBidsUsers({
            auctionId,
        });

        if (!auction) {
            return null;
        }

        const currentDate = new Date();

        return AuctionsMapper.mapToAdminView(auction, currentDate);
    }

    async getPublicAccessAuctionById(auctionId: string) {
        const auction = await this.auctionsRepository.findAuctionWithRoundsBidsUsers({
            auctionId,
        });

        if (!auction) {
            return null;
        }

        // auction.Rounds[0].Bids[0].User.Pseudonym[0];

        const currentDate = new Date();

        return AuctionsMapper.mapToPublicView(auction, currentDate);
    }

    async getNestedAuction(auctionId: string) {
        const auction = await this.auctionsRepository.findAuctionWithRoundsBidsUsers({
            auctionId,
        });

        if (!auction) {
            return null;
        }

        return auction;
    }

    async createInititalBid(dto: CreateInitialBidDto, userId: string, auctionId: string) {
        const auction = await this.auctionsRepository.findAuctionWithRoundsAndBids({
            auctionId,
        });

        if (auction === null) {
            throw new NotFoundException(`Auction with id ${auctionId} doesn't exist`);
        }

        const strategy = new DefaultAuctionStrategy(auction);

        const roundsWithBidsForUpdate = await strategy.createInititalBid(dto, userId);

        const userIdsOrder = roundsWithBidsForUpdate
            .find((round) => round.sequenceNumber === 0)
            .Bids.map(({ userId }) => userId);

        return Promise.all([
            this.roundsService.updateRoundsWithBids(roundsWithBidsForUpdate),
            this.pseudonymsService.makeNewOrderOfAuctionPseodonyms(auctionId, userIdsOrder),
        ]);
    }

    async removeInititalBid(userId: string, auctionId: string) {
        const auction = await this.auctionsRepository.findAuctionWithRoundsAndBids({
            auctionId,
        });

        if (auction === null) {
            throw new NotFoundException(`Auction with id ${auctionId} doesn't exist`);
        }

        const strategy = new DefaultAuctionStrategy(auction);

        const roundsWithBidsForUpdate = await strategy.removeUserFromRounds(userId);

        const userIdsOrder = roundsWithBidsForUpdate
            .find((round) => round.sequenceNumber === 0)
            .Bids.map(({ userId }) => userId);

        return Promise.all([
            this.roundsService.updateRoundsWithBids(roundsWithBidsForUpdate),
            this.pseudonymsService.makeNewOrderOfAuctionPseodonyms(auctionId, userIdsOrder),
        ]);
    }

    async makeUserBit(dto: MakeBidDto, userId: string, auctionId: string) {
        const data: UpdateBidDto = {
            total: dto.total,
            totalUpdatedAt: new Date(),
        };
        await this.bidsService.updateCurrentBid(data, auctionId, userId);
    }

    async getParticipationData(userId: string, auctionId: string) {
        const initialBids = await this.bidsService.getInitialBids(auctionId);

        const userInitialBid = initialBids.find((bid) => bid.userId === userId);

        if (!userInitialBid) {
            return {
                isParticipant: false,
            };
        }

        const pseudonym = userInitialBid.User.Pseudonym[0]
            ? userInitialBid.User.Pseudonym[0].value
            : null;

        return {
            isParticipant: true,
            pseudonym,
        };
    }
}
