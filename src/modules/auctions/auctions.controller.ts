import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AccessLevels } from '../auth/access-levels.decorator';
import { ResponseBody } from 'src/entities/framework/ResponseBody';
import { AuctionsService } from './auctions.service';
import { AccessLevel } from '../users/users.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AccessLevelGuard } from '../auth/access-level.guard';
import { CreateAuctionDto } from './dtos/CreateAuctionDto';
import { createResponseBody } from 'src/utils/createResponse';
import { AuthRequest } from 'src/entities/framework';
import { UpdateAuctionDto } from './dtos/UpdateAuctionDto';
import { CreateInitialBidDto } from './dtos/CreateInitialBidDto';
import { MakeBidDto } from './dtos/MakeBidDto';
import { AuctionGateway } from './auctions.gateway';

@Controller('auctions')
export class AuctionsController {
    constructor(
        private readonly auctionsService: AuctionsService,

        private auctionGateway: AuctionGateway,
    ) {}

    @AccessLevels(AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @HttpCode(201)
    @Post('/')
    async createAuction(
        @Body() dto: CreateAuctionDto,
        @Request() req: AuthRequest,
    ): Promise<ResponseBody> {
        const userData = req.user;
        const userId = userData.id;
        const auction = await this.auctionsService.createAuction(dto, userId);

        return createResponseBody(auction);
    }

    @AccessLevels(AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Get('/my')
    async getMyAuctions(@Request() req: AuthRequest): Promise<ResponseBody> {
        const userData = req.user;
        const userId = userData.id;
        const auctions = await this.auctionsService.getAuctionsByAuthorId(userId);

        return createResponseBody(auctions);
    }

    @Get('/')
    async getAllAuctions(): Promise<ResponseBody> {
        const auctions = await this.auctionsService.getAllAuctions();

        return createResponseBody(auctions);
    }

    @Get('info-only/:auctionId')
    async getAuctionById(@Param('auctionId') auctionId: string): Promise<ResponseBody> {
        const auction = await this.auctionsService.getPublicAccessAuctionById(auctionId);

        if (auction === null) {
            throw new NotFoundException(`Auction with id ${auctionId} doesn't exist`);
        }

        return createResponseBody(auction);
    }

    @Get('public/:auctionId')
    async getPublicAccessAuctionById(@Param('auctionId') auctionId: string): Promise<ResponseBody> {
        const auction = await this.auctionsService.getPublicAccessAuctionById(auctionId);

        if (auction === null) {
            throw new NotFoundException(`Auction with id ${auctionId} doesn't exist`);
        }

        return createResponseBody(auction);
    }

    @AccessLevels(AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Get('admin/:auctionId')
    async getFullAccessAuction(@Param('auctionId') auctionId: string) {
        const auction = await this.auctionsService.getFullAccessAuctionById(auctionId);

        if (auction === null) {
            throw new NotFoundException(`Auction with id ${auctionId} doesn't exist`);
        }

        return createResponseBody(auction);
    }

    @AccessLevels(AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Patch('/:auctionId')
    async updateAuctionById(
        @Param('auctionId') auctionId: string,
        @Body() dto: UpdateAuctionDto,
    ): Promise<ResponseBody> {
        const auction = await this.auctionsService.updateAuction(dto, auctionId);

        if (auction === null) {
            throw new NotFoundException(`Auction with id ${auctionId} doesn't exist`);
        }

        return createResponseBody(auction);
    }

    @AccessLevels(AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Delete('/:auctionId')
    async deleteAuctionById(@Param('auctionId') auctionId: string): Promise<ResponseBody> {
        const auction = await this.auctionsService.removeById(auctionId);

        if (auction === false) {
            throw new NotFoundException(`Auction with id ${auctionId} doesn't exist`);
        }

        return createResponseBody(null);
    }

    @AccessLevels(AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @HttpCode(201)
    @Post('/:auctionId/:userId/initial-bid')
    async addInitialBid(
        @Param('auctionId') auctionId: string,
        @Param('userId') userId: string,
        @Body() dto: CreateInitialBidDto,
    ) {
        await this.auctionsService.createInititalBid(dto, userId, auctionId);

        return createResponseBody('success');
    }

    @AccessLevels(AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Delete('/:auctionId/:userId/initial-bid')
    async removeInitialBid(@Param('auctionId') auctionId: string, @Param('userId') userId: string) {
        await this.auctionsService.removeInititalBid(userId, auctionId);

        return createResponseBody('success');
    }

    @AccessLevels(AccessLevel.REGULAR, AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Post('/:auctionId/bids')
    async makeBid(
        @Request() req: AuthRequest,
        @Param('auctionId') auctionId: string,
        @Body() dto: MakeBidDto,
    ): Promise<ResponseBody> {
        const userData = req.user;
        const userId = userData.id;
        await this.auctionsService.makeUserBit(dto, userId, auctionId);
        //maybe it's better to remove await :/
        await this.auctionGateway.loadAndSendUpdatedRoundsEvent(auctionId);
        return createResponseBody('success');
    }

    @AccessLevels(AccessLevel.REGULAR, AccessLevel.MANAGER, AccessLevel.ADMIN)
    @UseGuards(JwtAuthGuard, AccessLevelGuard)
    @Get('/:auctionId/participation')
    async amIParticion(
        @Request() req: AuthRequest,
        @Param('auctionId') auctionId: string,
    ): Promise<ResponseBody> {
        const userData = req.user;
        const userId = userData.id;

        const participationData = await this.auctionsService.getParticipationData(
            userId,
            auctionId,
        );

        return createResponseBody(participationData);
    }

    @Get('/participants/:userId')
    async getParticipantAuctions(@Param('userId') userId: string) {
        const auctions = await this.auctionsService.getParticipantAuctions(userId);
        return createResponseBody(auctions);
    }
}
