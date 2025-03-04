import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { Roles } from 'src/roles/roles.decorator';
import { Role } from 'src/enums/roles.enum';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGaurd } from 'src/roles/roles.guard';
import { ObjectId } from 'mongoose';
import { getFailureResponse } from 'src/utils';
import { SessionGuard } from 'src/sessiontoken/session.guard';

@Controller('api/problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @UseGuards(AuthGuard, SessionGuard)
  // @UseGuards(RolesGaurd)
  @Post('createProblem/:userId')
  @Roles(Role.Admin)
  async create(@Body() createProblemDto: CreateProblemDto) {
    try {
      return await this.problemsService.create(createProblemDto);
    } catch (error) {
      if (error instanceof Error) return getFailureResponse(error.message);
      return getFailureResponse('An unknown error occurred');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.problemsService.findAll();
    } catch (error) {
      if (error instanceof Error) return getFailureResponse(error.message);
      return getFailureResponse('An unknown error occurred');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: ObjectId) {
    try {
      const problem = await this.problemsService.findOne(id);
      if (!problem) {
        throw new NotFoundException();
      }
      return problem;
    } catch (error) {
      if (error instanceof Error) return getFailureResponse(error.message);
      return getFailureResponse('An unknown error occurred');
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, SessionGuard)
  // @UseGuards(RolesGaurd)
  @Patch(':id/:userId')
  async update(
    @Param('id') id: ObjectId,
    @Body() updateProblemDto: UpdateProblemDto,
  ) {
    try {
      return await this.problemsService.update(id, updateProblemDto);
    } catch (error) {
      if (error instanceof Error) return getFailureResponse(error.message);
      return getFailureResponse('An unknown error occurred');
    }
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, SessionGuard)
  // @UseGuards(RolesGaurd
  @Delete(':id/:userId')
  async remove(@Param('id') id: ObjectId) {
    try {
      return await this.problemsService.remove(id);
    } catch (error) {
      if (error instanceof Error) return getFailureResponse(error.message);
      return getFailureResponse('An unknown error occurred');
    }
  }

  // @Roles(Role.Admin)
  // @UseGuards(AuthGuard, RolesGaurd, SessionGuard)
  // @Patch(':id/add-points/:userId')
  // async addPoints(
  //   @Param('id') id: ObjectId,
  //   @Body('points') points: number, // รับค่า points จาก body
  // ) {
  //   try {
  //     if (!points || points <= 0) {
  //       throw new Error('Points must be a positive number');
  //     }
  //     const updatedProblem = await this.problemsService.addPoints(id, points);
  //     if (!updatedProblem) {
  //       throw new NotFoundException(`Problem with ID ${id} not found`);
  //     }
  //     return updatedProblem;
  //   } catch (error) {
  //     if (error instanceof Error) return getFailureResponse(error.message);
  //     return getFailureResponse('An unknown error occurred');
  //   }
  // }
}
