import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
    enum: ['todo', 'in progress', 'completed'],
    default: 'todo',
  })
  stage: string;

  @Prop([
    {
      type: {
        type: String,
        enum: [
          'assigned',
          'started',
          'in progress',
          'bug',
          'completed',
          'commented',
        ],
        default: 'assigned',
      },
      activity: { type: String },
      date: { type: Date, default: () => new Date() },
      by: { type: Types.ObjectId, ref: 'User' },
    },
  ])
  activities: {
    type: string;
    activity: string;
    date: Date;
    by: Types.ObjectId;
  }[];

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
