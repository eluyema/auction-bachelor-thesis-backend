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

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly auctionsService: AuctionsService) {}

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

        this.server.to(auctionId).emit('roundsUpdate', auction.Rounds);
    }

    sendUpdateRoundsEvent(auctionId: string, rounds: unknown) {
        this.server.to(auctionId).emit('roundsUpdate', rounds);
    }
}
