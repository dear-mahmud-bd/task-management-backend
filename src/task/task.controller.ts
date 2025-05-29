/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Query,
  HttpCode,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateSubTaskDto } from './dto/create-subtask.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // add task
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateTaskDto, @Req() req: any) {
    const userId = req.user.id as string;
    console.log(userId);
    return await this.taskService.create(dto, userId);
  }

  // add task activity...
  @UseGuards(JwtAuthGuard)
  @Patch('activity/:id')
  async postActivity(
    @Param('id') taskId: string,
    @Body() body: { type: string; activity: string },
    @Req() req: any,
  ) {
    const userId = req.user.id as string;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { type, activity } = body;
    return this.taskService.postTaskActivity(taskId, userId, type, activity);
  }

  // get dashboard statistics...
  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  async getDashboardStats(@Req() req: any) {
    const isAdmin = req.user.role === 'admin';
    const user = {
      userId: req.user.id as string,
      isAdmin,
    };
    if (!user || !user.userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const data = await this.taskService.getDashboardStatistics(user);
    return {
      status: true,
      message: 'Successfully.',
      ...data,
    };
  }

  // get all tasks (filter without filter)
  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getTasks(@Req() req: any, @Query() query: any) {
    const isAdmin = req.user.role === 'admin';
    const user = {
      userId: req.user.id as string,
      isAdmin,
    };
    if (!user || !user.userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const tasks = await this.taskService.getTasks(user, query);
    return {
      status: true,
      tasks,
    };
  }

  // get single task
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getTask(@Param('id') id: string) {
    const task = await this.taskService.getTaskById(id);
    if (!task) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return {
      status: true,
      task,
    };
  }

  // add sub task
  @Post('create-subtasks/:id')
  @HttpCode(200)
  async createSubTask(
    @Param('id') id: string,
    @Body() createSubTaskDto: CreateSubTaskDto,
  ) {
    await this.taskService.addSubTask(id, createSubTaskDto);
    return {
      status: true,
      message: 'SubTask added successfully.',
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
