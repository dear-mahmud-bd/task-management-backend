/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  // get user notification ...
  async getUserNotifications(userId: string) {
    return this.notificationModel
      .find({
        team: new Types.ObjectId(userId),
        isRead: { $nin: [new Types.ObjectId(userId)] },
      })
      .populate('task', 'title')
      .sort({ _id: -1 });
  }

  // mark as notification read ...
  async markAsRead(
    userId: string,
    isReadType: string,
    id?: string,
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);

    if (isReadType === 'all') {
      await this.notificationModel.updateMany(
        { team: userObjectId, isRead: { $nin: [userObjectId] } },
        { $push: { isRead: userObjectId } },
      );
    } else if (id) {
      await this.notificationModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          isRead: { $nin: [userObjectId] },
        },
        { $push: { isRead: userObjectId } },
      );
    }
  }

  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
