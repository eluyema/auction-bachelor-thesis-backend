import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { RoundsService } from './rounds.service';
import { RoundsRepository } from './rounds.repository';
import { BidsModule } from '../bids/bids.module';

@Module({
    imports: [PrismaModule, BidsModule],
    providers: [RoundsService, RoundsRepository],
    exports: [RoundsService],
})
export class RoundsModule {}
