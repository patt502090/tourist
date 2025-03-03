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

  async addParticipant(contestId: string, userId: string): Promise<{ contest: Contest; user: User }> {
    // ตรวจสอบว่า User เข้าร่วมแล้วหรือยัง
    const contest = await this.contestModel.findById(contestId).exec();
    if (!contest) throw new NotFoundException(`Contest with ID ${contestId} not found`);

    const userExists = contest.participantProgress.some((p) => p.userId.toString() === userId);
    if (!userExists) {
      // เพิ่ม User เข้า participantProgress ถ้ายังไม่เข้าร่วม
      await this.contestModel.findByIdAndUpdate(
        contestId,
        {
          $push: {
            participantProgress: {
              userId: new Types.ObjectId(userId),
              solvedProblems: 0,
              solvedProblemIds: [],
            },
          },
        },
        { new: true },
      ).exec();
    }

    // อัพเดต User.contests
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { contests: new Types.ObjectId(contestId) } }, // ใช้ $addToSet เพื่อป้องกันซ้ำ
      { new: true },
    ).exec();

    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    const updatedContest = await this.contestModel.findById(contestId).exec();
    return { contest: updatedContest, user };
  }

  async updateProblemSolved(contestId: string, userId: string, problemId: string, status: string): Promise<Contest> {
    if (status !== 'Accepted') {
      return this.contestModel.findById(contestId).exec();
    }

    const contest = await this.contestModel.findById(contestId).exec();
    if (!contest) throw new NotFoundException(`Contest with ID ${contestId} not found`);

    // ตรวจสอบว่า problemId อยู่ใน problems ของ contest
    if (!contest.problems.some((pid) => pid.toString() === problemId)) {
      throw new NotFoundException(`Problem ${problemId} not in contest ${contestId}`);
    }

    // ตรวจสอบว่า User เข้าร่วมแล้วหรือยัง
    const userProgress = contest.participantProgress.find((p) => p.userId.toString() === userId);
    if (!userProgress) {
      // ถ้ายังไม่เข้าร่วม เพิ่ม User เข้า participantProgress
      await this.addParticipant(contestId, userId);
      return this.updateProblemSolved(contestId, userId, problemId, status); // เรียกซ้ำหลังเพิ่ม
    }

    // อัพเดต solvedProblems ถ้า problemId ยังไม่ถูกนับ
    if (!userProgress.solvedProblemIds.some((pid) => pid.toString() === problemId)) {
      return this.contestModel.findByIdAndUpdate(
        contestId,
        {
          $inc: { 'participantProgress.$[elem].solvedProblems': 1 },
          $push: { 'participantProgress.$[elem].solvedProblemIds': new Types.ObjectId(problemId) },
        },
        {
          arrayFilters: [{ 'elem.userId': new Types.ObjectId(userId) }],
          new: true,
        },
      ).exec();
    }

    return contest;
  }

  async addProblem(contestId: string, problemId: string): Promise<Contest> {
    const contest = await this.contestModel.findById(contestId).exec();
    if (!contest) throw new NotFoundException(`Contest with ID ${contestId} not found`);

    // ตรวจสอบว่า problemId ยังไม่ถูกเพิ่ม
    if (contest.problems.some((pid) => pid.toString() === problemId)) {
      throw new NotFoundException(`Problem ${problemId} already exists in contest ${contestId}`);
    }

    // เพิ่ม problemId เข้าไปใน problems
    return this.contestModel.findByIdAndUpdate(
      contestId,
      { $push: { problems: new Types.ObjectId(problemId) } },
      { new: true },
    ).exec();
  }
}
