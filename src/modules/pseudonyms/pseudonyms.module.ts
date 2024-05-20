import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { PseudonymsService } from './pseudonyms.service';
import { PseudonymsRepository } from './pseudonyms.repository';

@Module({
    imports: [PrismaModule],
    providers: [PseudonymsService, PseudonymsRepository],
    exports: [PseudonymsService],
})
export class PseudonymsModule {}
