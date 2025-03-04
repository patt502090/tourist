import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { Contest } from 'src/Schemas/contest.schema';
import { User } from 'src/Schemas/user.schema';
import { Problem } from 'src/Schemas/problem.schema';

@Injectable()
export class ContestsService {
  constructor(
    @InjectModel(Contest.name) private contestModel: Model<Contest>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Problem.name) private problemModel: Model<Problem>,
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
    const contest = await this.contestModel.findById(contestId).exec();
    if (!contest)
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
  
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
  
    const userExists = contest.participantProgress.some(
      (p) => p.userId.toString() === userId,
    );
  
    let updatedContest;
    if (userExists) {
      // อัปเดตข้อมูลถ้ามีอยู่แล้ว
      updatedContest = await this.contestModel
        .findByIdAndUpdate(
          contestId,
          {
            $set: {
              'participantProgress.$[elem].username': user.username,
              'participantProgress.$[elem].email': user.email,
            },
          },
          {
            arrayFilters: [{ 'elem.userId': new Types.ObjectId(userId) }],
            new: true,
          },
        )
        .exec();
    } else {
      // เพิ่มใหม่ถ้ายังไม่มี
      updatedContest = await this.contestModel
        .findByIdAndUpdate(
          contestId,
          {
            $push: {
              participantProgress: {
                userId: new Types.ObjectId(userId),
                username: user.username,
                email: user.email,
                totalPoints: 0,
                solvedProblemIds: [],
              },
            },
          },
          { new: true },
        )
        .exec();
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $addToSet: { contests: new Types.ObjectId(contestId) } },
        { new: true },
      )
      .exec();

    updatedContest = await this.contestModel.findById(contestId).exec();
    return { contest: updatedContest, user: updatedUser };
  }

  async updateProblemSolved(
    contestId: string,
    userId: string,
    problemId: string,
    status: string,
  ): Promise<Contest> {
    // ถ้า status ไม่ใช่ 'Accepted' ให้คืนค่า contest เดิม ไม่ทำอะไร
    if (status !== 'Accepted') {
      return this.contestModel.findById(contestId).exec();
    }

    // ค้นหา contest
    const contest = await this.contestModel.findById(contestId).exec();
    if (!contest)
      throw new NotFoundException(`Contest with ID ${contestId} not found`);

    // ตรวจสอบว่า problemId อยู่ใน problems ของ contest
    if (!contest.problems.some((pid) => pid.toString() === problemId)) {
      throw new NotFoundException(
        `Problem ${problemId} not in contest ${contestId}`,
      );
    }

    // ค้นหา problem เพื่อดึง points
    const problem = await this.problemModel.findById(problemId).exec();
    if (!problem)
      throw new NotFoundException(`Problem with ID ${problemId} not found`);

    // ค้นหา user
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // ตรวจสอบว่า user เข้าร่วม contest แล้วหรือยัง
    let userProgress = contest.participantProgress.find(
      (p) => p.userId.toString() === userId,
    );
    if (!userProgress) {
      // ถ้ายังไม่เข้าร่วม เพิ่ม user เข้า participantProgress
      await this.contestModel
        .findByIdAndUpdate(
          contestId,
          {
            $push: {
              participantProgress: {
                userId: new Types.ObjectId(userId),
                username: user.username,
                email: user.email,
                totalPoints: 0,
                solvedProblemIds: [],
              },
            },
          },
          { new: true },
        )
        .exec();
      // รีเฟรช contest หลังจากเพิ่ม participant
      const updatedContest = await this.contestModel.findById(contestId).exec();
      userProgress = updatedContest.participantProgress.find(
        (p) => p.userId.toString() === userId,
      );
    }

    // ตรวจสอบว่าโจทย์นี้ยังไม่ถูกแก้
    if (
      !userProgress.solvedProblemIds.some((pid) => pid.toString() === problemId)
    ) {
      // อัปเดต solvedProblemIds และ totalPoints
      const updatedContest = await this.contestModel
        .findByIdAndUpdate(
          contestId,
          {
            $push: {
              'participantProgress.$[elem].solvedProblemIds':
                new Types.ObjectId(problemId),
            },
            $inc: {
              'participantProgress.$[elem].totalPoints': problem.points || 0,
            },
          },
          {
            arrayFilters: [{ 'elem.userId': new Types.ObjectId(userId) }],
            new: true,
          },
        )
        .exec();
      return updatedContest;
    }

    // ถ้าโจทย์ถูกแก้ไปแล้ว คืนค่า contest เดิม
    return contest;
  }

  async addProblem(contestId: string, problemId: string): Promise<Contest> {
    // Fetch the contest
    const contest = await this.contestModel.findById(contestId).exec();
    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    // Check if problem already exists in contest
    if (contest.problems.some((pid) => pid.toString() === problemId)) {
      throw new NotFoundException(
        `Problem ${problemId} already exists in contest ${contestId}`,
      );
    }

    // Update the contest: add problem to problems array
    const updatedContest = await this.contestModel
      .findByIdAndUpdate(
        contestId,
        { $push: { problems: new Types.ObjectId(problemId) } },
        { new: true },
      )
      .exec();

    // Update the problem: set contest reference
    await this.problemModel
      .findByIdAndUpdate(
        problemId,
        { contest: new Types.ObjectId(contestId) },
        { new: true },
      )
      .exec();

    return updatedContest;
  }
}
