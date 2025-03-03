import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8081, {cors:{origin:"*"}})
export class ContestGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // เก็บรายชื่อผู้ใช้ในแต่ละ contest (ใน memory)
  private contestUsers: { [contestId: string]: Set<string> } = {};

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
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  // เมื่อ client เข้าร่วม contest
  @SubscribeMessage('joinContest')
  handleJoinContest(client: Socket, data: { contestId: string; userId: string }): void {
    const { contestId, userId } = data;

    // ถ้ายังไม่มี contest นี้ใน memory ให้สร้างใหม่
    if (!this.contestUsers[contestId]) {
      this.contestUsers[contestId] = new Set();
    }

    // เพิ่ม user เข้า contest (ใช้ userId หรือ client.id ก็ได้ ขึ้นกับการออกแบบ)
    this.contestUsers[contestId].add(userId);
    client.join(contestId); // เข้าห้อง WebSocket

    // Broadcast รายชื่อผู้ใช้ให้ทุกคนใน contest
    this.broadcastUserList(contestId);
  }

  // ออกจาก contest
  @SubscribeMessage('leaveContest')
  handleLeaveContest(client: Socket, contestId: string): void {
    if (this.contestUsers[contestId]) {
      this.contestUsers[contestId].delete(client.id); // หรือใช้ userId ถ้ามีการส่งมา
      client.leave(contestId);
      this.broadcastUserList(contestId);
    }
  }

  // ส่งรายชื่อผู้ใช้ไปยังทุกคนใน contest
  private broadcastUserList(contestId: string): void {
    const users = Array.from(this.contestUsers[contestId] || []);
    this.server.to(contestId).emit('userUpdate', { contestId, users });
  }
}