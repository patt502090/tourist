import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { ContestSchema } from 'src/Schemas/contest.schema';
import { Userschema } from 'src/Schemas/user.schema';
import { ProblemSchema } from 'src/Schemas/problem.schema';
import { ContestGateway } from './contest.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Contest', schema: ContestSchema }]),
    MongooseModule.forFeature([{ name: 'User', schema: Userschema }]),
    MongooseModule.forFeature([{ name: 'Problem', schema: ProblemSchema }]),
  ],
  controllers: [ContestsController],
  providers: [ContestsService, ContestGateway],
  exports: [ContestsService, MongooseModule],
})
export class ContestsModule {}
