// src/notification/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
// import { User } from '../../user/schemas/user.schema';
// import { Task } from '../../task/schemas/task.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  team: Types.ObjectId[];

  @Prop({ type: String })
  text: string;

  @Prop({ type: Types.ObjectId, ref: 'Task' })
  task: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['alert', 'message'],
    default: 'alert',
  })
  notiType: 'alert' | 'message';

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  isRead: Types.ObjectId[];
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
