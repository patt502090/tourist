import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { Contest } from 'src/Schemas/contest.schema';
import { User } from 'src/Schemas/user.schema';

@Injectable()
export class ContestsService {
  constructor(
    @InjectModel(Contest.name) private contestModel: Model<Contest>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createContestDto: CreateContestDto): Promise<Contest> {
    const createdContest = new this.contestModel(createContestDto);
    return createdContest.save();
  }

  async findAll(): Promise<Contest[]> {
    return this.contestModel.find().exec();
  }

  async findOne(id: string): Promise<Contest> {
    return this.contestModel.findById(id).exec();
  }

  async update(
    id: string,
    updateContestDto: UpdateContestDto,
  ): Promise<Contest> {
    return this.contestModel
      .findByIdAndUpdate(id, updateContestDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.contestModel.findByIdAndDelete(id).exec();
  }

  async addParticipant(
    contestId: string,
    userId: string,
  ): Promise<{ contest: Contest; user: User }> {
    try {
      // อัพเดต Contest
      const contest = await this.contestModel
        .findByIdAndUpdate(
          contestId,
          { $push: { participants: new Types.ObjectId(userId) } },
          { new: true },
        )
        .exec();

      if (!contest) {
        throw new NotFoundException(`Contest with ID ${contestId} not found`);
      }

      // อัพเดต User
      const user = await this.userModel
        .findByIdAndUpdate(
          userId,
          { $push: { contests: new Types.ObjectId(contestId) } },
          { new: true },
        )
        .exec();

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return { contest, user };
    } catch (error) {
      console.error('Error in addParticipant:', error); // เพิ่ม log เพื่อ debug
      throw error; // ให้ NestJS handle error
    }
  }
}
