import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Problem } from './problem.schema';
import { User } from './user.schema';

@Schema()
export class Contest extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: () => Problem }],
    default: [],
  })
  problems: Types.ObjectId[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: () => User },
        totalPoints: { type: Number, default: 0 }, // เปลี่ยนชื่อเป็น totalPoints เพื่อสะท้อนคะแนนรวม
        solvedProblemIds: [{ type: Types.ObjectId, ref: () => Problem }], // รายการโจทย์ที่แก้ได้
      },
    ],
    default: [],
  })
  participantProgress: {
    userId: Types.ObjectId;
    username: string; // เพิ่มฟิลด์นี้
    email: string; // เพิ่มฟิลด์นี้
    totalPoints: number; // คะแนนรวมจากการแก้โจทย์
    solvedProblemIds: Types.ObjectId[];
  }[];
}

export const ContestSchema = SchemaFactory.createForClass(Contest);
