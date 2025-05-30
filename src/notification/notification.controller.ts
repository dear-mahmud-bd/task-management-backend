/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // get notification list...
  // @UseGuards(JwtAuthGuard)
  @Get()
  async getUserNotifications(@Req() req: any) {
    const userId = req.user?.id;
    return this.notificationService.getUserNotifications(userId as string);
  }

  // mark as notification read ...
  // @UseGuards(JwtAuthGuard)
  @Patch('read')
  async markNotificationRead(
    @Query('isReadType') isReadType: string,
    @Query('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const userId = (req.user as any).userId;

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

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(+id);
  }
}
