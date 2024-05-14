// auction.gateway.ts

import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionsService } from './auctions.service';
import { isArray } from 'class-validator';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RoundsMapper } from '../rounds/rounds.mapper';
import { createResponseBody } from 'src/utils/createResponse';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly auctionsService: AuctionsService,
        private readonly schedulerRegistry: SchedulerRegistry,
    ) {}

    @WebSocketServer()
    server: Server;

    async handleConnection(@ConnectedSocket() client: Socket) {
        const queryAuctionId = client.handshake.query.auctionId;
        const auctionId = isArray(queryAuctionId) ? queryAuctionId[0] : queryAuctionId;
        if (auctionId) {
            const auction = await this.auctionsService.getPublicAccessAuctionById(auctionId);
            if (auction === null) {
                client.disconnect();
                return;
            }
            await this.setupUpdateEvents(auctionId);
            client.join(auctionId);
            console.log(`Client ${client.id} connected and joined auction ${auctionId}`);
            this.sendUpdateRoundsEvent(auctionId, auction.Rounds);
        } else {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    async loadAndSendUpdatedRoundsEvent(auctionId: string) {
        const auction = await this.auctionsService.getPublicAccessAuctionById(auctionId);

        if (!auction) {
            return;
        }
        this.sendUpdateRoundsEvent(auctionId, auction.Rounds);
    }

    sendUpdateRoundsEvent(auctionId: string, rounds: unknown) {
        this.server.to(auctionId).emit('roundsUpdate', createResponseBody(rounds));
    }

    async setupUpdateEvents(auctionId: string) {
        const onStartEvent = 'on_auction_start_' + auctionId;

        const status = this.schedulerRegistry.doesExist('timeout', onStartEvent);

        if (status) {
            console.log('Already setuped');
            return;
        }

        const auction = await this.auctionsService.getNestedAuction(auctionId);

        const onFirstRoundStart = 'on_fisrt_round_start_' + auction.id;

        const onLastRoundFinished = 'on_last_round_finished' + auction.id;

        const updateJob = () => {
            this.loadAndSendUpdatedRoundsEvent(auctionId);
        };

        const onFirstRoundStartAt = async () => {
            this.loadAndSendUpdatedRoundsEvent(auctionId);
            const lastUpdatedAuction = await this.auctionsService.getNestedAuction(auctionId);
            console.log('onFirstRoundStartAt', auctionId, lastUpdatedAuction);
            if (!lastUpdatedAuction) {
                return;
            }

            const lastBid = RoundsMapper.getLastBid(lastUpdatedAuction.Rounds);

            if (!lastBid) {
                return;
            }

            this.addTimeoutJob(onLastRoundFinished, lastBid.endAt, auction.id, updateAndDisconnect);
        };

        const updateAndDisconnect = () => {
            this.loadAndSendUpdatedRoundsEvent(auctionId).then(() => {
                this.server.in(auctionId).disconnectSockets();
            });
        };

        this.addTimeoutJob(onStartEvent, auction.auctionStartAt, auction.id, updateJob);
        this.addTimeoutJob(
            onFirstRoundStart,
            auction.firstRoundStartAt,
            auction.id,
            onFirstRoundStartAt,
        );
    }

    addTimeoutJob(name: string, date: string | Date, auctionId: string, job: () => void) {
        try {
            const startTime = new Date(date);
            const now = new Date();
            const delay = startTime.getTime() - now.getTime();

            if (delay < 0) {
                return;
            }

            const timeout = setTimeout(job, delay);

            this.schedulerRegistry.addTimeout(name, timeout);
            console.log(`Timeout job ${name} added for auction ${auctionId} at ${startTime}`);
        } catch (err) {
            console.error(err);
        }
    }

    deleteTimeoutJob(name: string) {
        this.schedulerRegistry.deleteTimeout(name);
        console.log(`Timeout job ${name} deleted`);
    }
}
