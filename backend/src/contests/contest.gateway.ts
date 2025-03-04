// contest.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { ContestsService } from './contests.service';

@WebSocketGateway(8082, { cors: { origin: '*' } })
export class ContestGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private contestUsers: { [contestId: string]: Set<string> } = {};

  constructor(
    @Inject(ContestsService) private readonly contestsService: ContestsService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    for (const contestId in this.contestUsers) {
      if (this.contestUsers[contestId].has(client.id)) {
        this.contestUsers[contestId].delete(client.id);
        this.broadcastUserList(contestId);
        this.broadcastScoreUpdate(contestId);
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinContest')
  async handleJoinContest(
    client: Socket,
    data: { contestId: string; userId: string },
  ): Promise<void> {
    const { contestId, userId } = data;
    console.log(
      `Join contest requested: contestId=${contestId}, userId=${userId}`,
    );

    if (!this.contestUsers[contestId]) {
      this.contestUsers[contestId] = new Set();
      console.log(`Created new contest room: ${contestId}`);
    }

    this.contestUsers[contestId].add(userId);
    client.join(contestId);
    console.log(
      `User ${userId} joined contest ${contestId}. Total users: ${this.contestUsers[contestId].size}`,
    );

    this.broadcastUserList(contestId);
    await this.broadcastScoreUpdate(contestId);
  }

  @SubscribeMessage('leaveContest')
  async handleLeaveContest(client: Socket, contestId: string): Promise<void> {
    if (this.contestUsers[contestId]) {
      this.contestUsers[contestId].delete(client.id);
      client.leave(contestId);
      console.log(
        `User left contest ${contestId}. Remaining users: ${this.contestUsers[contestId].size}`,
      );
      this.broadcastUserList(contestId);
      await this.broadcastScoreUpdate(contestId);
    }
  }

  private broadcastUserList(contestId: string): void {
    const users = Array.from(this.contestUsers[contestId] || []);
    console.log(`Broadcasting user list for contest ${contestId}:`, users);
    this.server.to(contestId).emit('userUpdate', { contestId, users });
  }

  private async broadcastScoreUpdate(contestId: string): Promise<void> {
    try {
      const contest = await this.contestsService.findOne(contestId);
      if (!contest) {
        console.log(`Contest ${contestId} not found in database`);
        return;
      }
      const scoreboard = contest.participantProgress.map((participant) => ({
        userId: participant.userId.toString(),
        username: participant.username,
        totalPoints: participant.totalPoints,
        solvedProblems: participant.solvedProblemIds.length,
      }));
      console.log(
        `Broadcasting scoreboard for contest ${contestId}:`,
        scoreboard,
      );
      this.server.to(contestId).emit('scoreUpdate', { contestId, scoreboard });
    } catch (error) {
      console.error(
        `Error broadcasting score update for contest ${contestId}:`,
        error,
      );
    }
  }
}
