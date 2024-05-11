import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { AuctionsRepository } from './auctions.repository';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { RoundsModule } from '../rounds/rounds.module';
import { UsersModule } from '../users/users.module';
import { BidsModule } from '../bids/bids.module';

@Module({
    imports: [PrismaModule, RoundsModule, UsersModule, BidsModule],
    controllers: [AuctionsController],
    providers: [AuctionsService, AuctionsRepository],
    exports: [AuctionsService],
})
export class AuctionsModule {}
