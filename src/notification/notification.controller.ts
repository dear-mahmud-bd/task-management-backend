/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Body,
  Patch,
  Req,
  UseGuards,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // get notification list...
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserNotifications(@Req() req: any) {
    const userId = req.user?.id;
    return this.notificationService.getUserNotifications(userId as string);
  }

  // mark as notification read ...
  @UseGuards(JwtAuthGuard)
  @Patch('read')
  async markNotificationRead(
    @Query('isReadType') isReadType: string,
    @Query('id') id: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user.id as string;
    try {
      await this.notificationService.markAsRead(userId, isReadType, id);
      return res
        .status(HttpStatus.CREATED)
        .json({ status: true, message: 'Done' });
    } catch (error) {
      console.error(error);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ status: false, message: 'Something went wrong' });
    }
  }
}
