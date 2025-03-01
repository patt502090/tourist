import { Module } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { ContestsGateway } from './contests.gateway';

@Module({
  providers: [ContestsGateway, ContestsService],
})
export class ContestsModule {}
