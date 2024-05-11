import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { BidsService } from './bids.service';
import { BidsRepository } from './bids.repository';

@Module({
    imports: [PrismaModule],
    providers: [BidsService, BidsRepository],
    exports: [BidsService],
})
export class BidsModule {}
