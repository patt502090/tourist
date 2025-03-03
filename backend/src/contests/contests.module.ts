import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { Contest, ContestSchema } from 'src/Schemas/contest.schema';
import { ContestGateway } from './contest.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contest.name, schema: ContestSchema }]),
  ],
  controllers: [ContestsController],
  providers: [ContestsService, ContestGateway],
})
export class ContestsModule {}