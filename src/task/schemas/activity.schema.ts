import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ _id: false })
export class Activity {
  @Prop({
    type: String,
    enum: [
      'assigned',
      'started',
      'in_progress',
      'bug',
      'completed',
      'commented',
    ],
    default: 'assigned',
  })
  type: string;

  @Prop()
  activity: string;

  @Prop({ default: () => new Date() })
  date: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  by: Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
