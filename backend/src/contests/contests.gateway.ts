import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';

@WebSocketGateway(8081, { cors: { origin: '*' } })
export class ContestsGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly contestsService: ContestsService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id); // Log เมื่อ client connect
  }

  @SubscribeMessage('newMessage')
  handleMessage(client: Socket, payload: any): string {
    console.log('Received newMessage:', payload);
    client.emit('newMessage', payload);
    this.server.emit('newMessage', payload);
    return 'Hello from server';
  }

  @SubscribeMessage('createContest')
  create(client: Socket, @MessageBody() createContestDto: CreateContestDto) {
    console.log('Received createContest:', createContestDto);
    const result = this.contestsService.create(createContestDto);
    client.emit('contestCreated', result);
    this.server.emit('newContest', result);
    return result;
  }

  @SubscribeMessage('findAllContests')
  findAll(client: Socket) {
    return this.contestsService.findAll();
  }

  @SubscribeMessage('findOneContest')
  findOne(client: Socket, @MessageBody() id: number) {
    return this.contestsService.findOne(id);
  }

  @SubscribeMessage('updateContest')
  update(client: Socket, @MessageBody() updateContestDto: UpdateContestDto) {
    return this.contestsService.update(updateContestDto.id, updateContestDto);
  }

  @SubscribeMessage('removeContest')
  remove(client: Socket, @MessageBody() id: number) {
    return this.contestsService.remove(id);
  }
}
