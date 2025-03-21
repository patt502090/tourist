import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { Contest } from 'src/Schemas/contest.schema';
import { User } from 'src/Schemas/user.schema';
import { Problem } from 'src/Schemas/problem.schema';
import { PubSub } from '@google-cloud/pubsub';
import { format, differenceInMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
@Injectable()
export class ContestsService {
  private pubSubClient: PubSub;
  private readonly timeZone = 'Asia/Bangkok'; // UTC+7
  constructor(
    @InjectModel(Contest.name) private contestModel: Model<Contest>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Problem.name) private problemModel: Model<Problem>,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.pubSubClient = new PubSub({ projectId: 'tourist-452409' });
    this.setupCronJob();
  }
  private setupCronJob() {
    const job = new CronJob(
      '0 */30 * * * *', // ทุก 30 นาที
      () => this.checkUpcomingContests(),
      null,
      true,
      this.timeZone,
    );
    this.schedulerRegistry.addCronJob('checkUpcomingContests', job);
    job.start();
  }

  async checkUpcomingContests() {
    const nowThai = toZonedTime(new Date(), this.timeZone); // เวลาไทยปัจจุบัน

    const upcomingContests = await this.contestModel.find().exec();

    for (const contest of upcomingContests) {
      const startTimeThai = toZonedTime(contest.startTime, this.timeZone); // แปลงเป็นเวลาไทย
      const timeDiffMinutes = differenceInMinutes(startTimeThai, nowThai); // นาทีที่เหลือ

      if (timeDiffMinutes <= 30 && timeDiffMinutes > 0) {
        await this.sendNotification(contest, startTimeThai);
      }
    }
  }

  async sendNotification(contest: Contest, startTimeThai: Date) {
    const formattedTime = format(startTimeThai, 'dd/MM/yyyy HH:mm'); // เวลาไทย

    // เตรียมข้อมูลสำหรับ Pub/Sub
    const participants = contest.participantProgress.map((participant) => ({
      userId: participant.userId.toString(),
      username: participant.username,
      email: participant.email,
    }));

    const data = JSON.stringify({
      contestId: contest._id.toString(),
      title: contest.title,
      startTime: contest.startTime.toISOString(), // UTC
      startTimeThai: formattedTime, // เวลาไทย
      participants,
    });

    const dataBuffer = Buffer.from(data);
    const topicName = 'contest-notifications';

    try {
      await this.pubSubClient.topic(topicName).publish(dataBuffer);
      console.log(`เผยแพร่การแจ้งเตือนสำหรับ ${contest.title} ไปยัง Pub/Sub`);
    } catch (error) {
      console.error(`เกิดข้อผิดพลาดในการเผยแพร่ไปยัง Pub/Sub: ${error}`);
    }
  }
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
      // อัปเดต solvedProblemIds และ totalPoints ใน contest
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

      // อัปเดต distance ใน user โดยเพิ่ม points ของ problem
      await this.userModel
        .findByIdAndUpdate(
          userId,
          {
            $inc: { distance: problem.points || 0 }, // เพิ่ม distance ตาม points
          },
          { new: true },
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
  async removeProblem(contestId: string, problemId: string): Promise<Contest> {
    // ค้นหา contest
    const contest = await this.contestModel.findById(contestId).exec();
    if (!contest) {
      throw new NotFoundException(`Contest with ID ${contestId} not found`);
    }

    // ตรวจสอบว่า problem มีอยู่ใน contest หรือไม่
    if (!contest.problems.some((pid) => pid.toString() === problemId)) {
      throw new NotFoundException(
        `Problem ${problemId} not found in contest ${contestId}`,
      );
    }

    // ลบ problem ออกจาก array problems
    const updatedContest = await this.contestModel
      .findByIdAndUpdate(
        contestId,
        { $pull: { problems: new Types.ObjectId(problemId) } },
        { new: true },
      )
      .exec();

    // ลบการอ้างอิง contest ออกจาก problem (ถ้ามีฟิลด์ contest ใน Problem schema)
    await this.problemModel
      .findByIdAndUpdate(
        problemId,
        { $unset: { contest: '' } }, // ลบฟิลด์ contest
        { new: true },
      )
      .exec();

    return updatedContest;
  }
}
