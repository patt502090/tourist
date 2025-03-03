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

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ContestGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // เก็บรายชื่อผู้ใช้ในแต่ละ contest (ใน memory)
  private contestUsers: { [contestId: string]: Set<string> } = {};

  constructor(
    @Inject(ContestsService) private readonly contestsService: ContestsService, // Inject ContestsService
  ) {}

  // เมื่อ client เชื่อมต่อ
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // เมื่อ client ออก
  handleDisconnect(client: Socket) {
    for (const contestId in this.contestUsers) {
      if (this.contestUsers[contestId].has(client.id)) {
        this.contestUsers[contestId].delete(client.id);
        this.broadcastUserList(contestId);
        this.broadcastScoreUpdate(contestId); // อัปเดตคะแนนเมื่อมีคนออก
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  // เมื่อ client เข้าร่วม contest
  @SubscribeMessage('joinContest')
  async handleJoinContest(
    client: Socket,
    data: { contestId: string; userId: string },
  ): Promise<void> {
    const { contestId, userId } = data;

    // ถ้ายังไม่มี contest นี้ใน memory ให้สร้างใหม่
    if (!this.contestUsers[contestId]) {
      this.contestUsers[contestId] = new Set();
    }

    // เพิ่ม user เข้า contest
    this.contestUsers[contestId].add(userId);
    client.join(contestId); // เข้าห้อง WebSocket

    // Broadcast รายชื่อผู้ใช้และคะแนน
    this.broadcastUserList(contestId);
    await this.broadcastScoreUpdate(contestId); // อัปเดตคะแนนเมื่อมีคนเข้าร่วม
  }

  // ออกจาก contest
  @SubscribeMessage('leaveContest')
  async handleLeaveContest(client: Socket, contestId: string): Promise<void> {
    if (this.contestUsers[contestId]) {
      this.contestUsers[contestId].delete(client.id); // หรือใช้ userId ถ้ามีการส่งมา
      client.leave(contestId);
      this.broadcastUserList(contestId);
      await this.broadcastScoreUpdate(contestId); // อัปเดตคะแนนเมื่อมีคนออก
    }
  }

  // รับการอัปเดตคะแนนจากการ submit
  @SubscribeMessage('submitProblem')
  async handleSubmitProblem(
    client: Socket,
    data: {
      contestId: string;
      userId: string;
      problemId: string;
      status: string;
    },
  ): Promise<void> {
    const { contestId, userId, problemId, status } = data;

    // เรียก ContestsService เพื่ออัปเดตคะแนน
    await this.contestsService.updateProblemSolved(
      contestId,
      userId,
      problemId,
      status,
    );

    // Broadcast คะแนนที่อัปเดตไปยังทุกคนใน contest
    await this.broadcastScoreUpdate(contestId);
  }

  // ส่งรายชื่อผู้ใช้ไปยังทุกคนใน contest
  private broadcastUserList(contestId: string): void {
    const users = Array.from(this.contestUsers[contestId] || []);
    this.server.to(contestId).emit('userUpdate', { contestId, users });
  }

  // ส่งข้อมูลคะแนน (scoreboard) ไปยังทุกคนใน contest
  private async broadcastScoreUpdate(contestId: string): Promise<void> {
    try {
      const contest = await this.contestsService.findOne(contestId);
      if (!contest) return;

      // สร้างข้อมูล scoreboard จาก participantProgress
      const scoreboard = contest.participantProgress.map((participant) => ({
        userId: participant.userId.toString(),
        username: participant.username,
        totalPoints: participant.totalPoints,
        solvedProblems: participant.solvedProblemIds.length,
      }));

      // ส่งข้อมูล scoreboard ไปยัง client ทุกคนใน contest
      this.server.to(contestId).emit('scoreUpdate', {
        contestId,
        scoreboard,
      });
    } catch (error) {
      console.error(
        `Error broadcasting score update for contest ${contestId}:`,
        error,
      );
    }
  }
}
