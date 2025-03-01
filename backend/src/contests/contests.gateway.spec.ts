import { Test, TestingModule } from '@nestjs/testing';
import { ContestsGateway } from './contests.gateway';
import { ContestsService } from './contests.service';

describe('ContestsGateway', () => {
  let gateway: ContestsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestsGateway, ContestsService],
    }).compile();

    gateway = module.get<ContestsGateway>(ContestsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
