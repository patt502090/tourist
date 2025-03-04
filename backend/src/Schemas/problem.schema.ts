import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { codesnipet, metadata } from 'src/interfaces/config.interface';
import { Contest } from './contest.schema';

export type ProblemDocument = HydratedDocument<Problem>;
const difficultyLevels = ['easy', 'medium', 'hard'];
export interface testcase {
  input: string;
  output: string;
}
@Schema()
export class Problem {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: String, enum: difficultyLevels, default: difficultyLevels[0] })
  difficulty: string;

  @Prop({ required: true })
  sampleInput: string;

  @Prop({ required: true })
  sampleOutput: string;

  @Prop()
  testCases: testcase[];

  @Prop()
  status: string;

  @Prop()
  starterCode: codesnipet[];

  @Prop()
  systemCode: codesnipet[];

  @Prop({ type: Object })
  metadata: metadata;

  @Prop({ type: Types.ObjectId, ref: 'Contest' })
  contest?: Contest;

  @Prop({ type: Number, default: 100 })
  points: number;
}

export const ProblemSchema = SchemaFactory.createForClass(Problem);
