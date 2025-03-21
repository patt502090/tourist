import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProblemsModule } from './problems/problems.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/config';
import { AuthModule } from './auth/auth.module';
import { RetrytokenModule } from './retrytoken/retrytoken.module';
import { SessiontokenModule } from './sessiontoken/sessiontoken.module';
import { ContestsModule } from './contests/contests.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forRoot(config().mongodb.database.connectionString, {
      connectionFactory: (connection) => {
        console.log('MongoDB Connection String:', config().mongodb.database.connectionString);
        return connection;
      },
    }),
    UsersModule,
    ScheduleModule.forRoot(),
    ProblemsModule,
    RetrytokenModule,
    AuthModule,
    SessiontokenModule,
    ContestsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}