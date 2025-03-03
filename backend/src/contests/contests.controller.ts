import { Controller, Get, Post, Body, Patch, Param, Delete, Put, NotFoundException } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';

@Controller('api/contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Post()
  create(@Body() createContestDto: CreateContestDto) {
    return this.contestsService.create(createContestDto);
  }

  @Get()
  findAll() {
    return this.contestsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contestsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateContestDto: UpdateContestDto) {
    return this.contestsService.update(id, updateContestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contestsService.remove(id);
  }

  @Put(':id/join')
  async addParticipant(@Param('id') contestId: string, @Body('userId') userId: string) {
    if (!userId) throw new NotFoundException('userId is required in request body');
    return this.contestsService.addParticipant(contestId, userId);
  }

  @Post(':id/submissions')
  async submitProblem(
    @Param('id') contestId: string,
    @Body('userId') userId: string,
    @Body('problemId') problemId: string,
    @Body('status') status: string,
  ) {
    if (!userId || !problemId || !status) {
      throw new NotFoundException('userId, problemId, and status are required');
    }
    return this.contestsService.updateProblemSolved(contestId, userId, problemId, status);
  }

  @Post(':id/problems')
  async addProblem(@Param('id') contestId: string, @Body('problemId') problemId: string) {
    if (!problemId) throw new NotFoundException('problemId is required in request body');
    return this.contestsService.addProblem(contestId, problemId);
  }
}