import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { Contest } from 'src/Schemas/contest.schema';

@Injectable()
export class ContestsService {
  constructor(@InjectModel(Contest.name) private contestModel: Model<Contest>) {}

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

  async update(id: string, updateContestDto: UpdateContestDto): Promise<Contest> {
    return this.contestModel.findByIdAndUpdate(id, updateContestDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.contestModel.findByIdAndDelete(id).exec();
  }
}