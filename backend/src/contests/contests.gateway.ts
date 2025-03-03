import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';

@WebSocketGateway()
export class ContestsGateway {
  constructor(private readonly contestsService: ContestsService) {}

  @SubscribeMessage('createContest')
  create(@MessageBody() createContestDto: CreateContestDto) {
    return this.contestsService.create(createContestDto);
  }

  @SubscribeMessage('findAllContests')
  findAll() {
    return this.contestsService.findAll();
  }

  @SubscribeMessage('findOneContest')
  findOne(@MessageBody() id: number) {
    return this.contestsService.findOne(id);
  }

  @SubscribeMessage('updateContest')
  update(@MessageBody() updateContestDto: UpdateContestDto) {
    return this.contestsService.update(updateContestDto.id, updateContestDto);
  }

  @SubscribeMessage('removeContest')
  remove(@MessageBody() id: number) {
    return this.contestsService.remove(id);
  }
}
