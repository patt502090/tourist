import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Contest extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;
}

export const ContestSchema = SchemaFactory.createForClass(Contest);