import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContestsService } from './contests.service';
import { ContestsController } from './contests.controller';
import { Contest, ContestSchema } from 'src/Schemas/contest.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contest.name, schema: ContestSchema }]),
    UsersModule,
  ],
  controllers: [ContestsController],
  providers: [ContestsService],
  exports: [ContestsService, MongooseModule], 
})
export class ContestsModule {}