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
    type: [{
      userId: { type: Types.ObjectId, ref: () => User },
      solvedProblems: { type: Number, default: 0 }, // จำนวนโจทย์ที่ทำเสร็จ
      solvedProblemIds: [{ type: Types.ObjectId, ref: () => Problem }], // โจทย์ที่ทำเสร็จ
    }],
    default: [],
  })
  participantProgress: { userId: Types.ObjectId; solvedProblems: number; solvedProblemIds: Types.ObjectId[] }[]; 
}

export const ContestSchema = SchemaFactory.createForClass(Contest);