import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Activity, ActivitySchema } from './activity.schema';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, default: () => new Date() })
  date: Date;

  @Prop({
    type: String,
    enum: ['high', 'medium', 'normal', 'low'],
    default: 'normal',
  })
  priority: string;

  @Prop({
    type: String,
    enum: ['todo', 'in_progress', 'completed'],
    default: 'todo',
  })
  stage: string;

  @Prop({ type: [ActivitySchema] })
  activities: Activity[];

  @Prop([
    {
      title: String,
      date: Date,
      tag: String,
      isCompleted: Boolean,
    },
  ])
  subTasks: {
    title: string;
    date: Date;
    tag: string;
    isCompleted: boolean;
  }[];

  @Prop()
  description: string;

  @Prop([String])
  assets: string[];

  @Prop([String])
  links: string[];

  @Prop({ required: true, type: [{ type: Types.ObjectId, ref: 'User' }] })
  team: Types.ObjectId[];

  @Prop({ default: false })
  isTrashed: boolean;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
