import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Problem } from './problem.schema';

@Schema()
export class Contest extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Problem' }], default: [] }) 
  problems: Problem[];
}

export const ContestSchema = SchemaFactory.createForClass(Contest);