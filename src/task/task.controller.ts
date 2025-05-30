/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Query,
  HttpCode,
  Put,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateSubTaskDto } from './dto/create-subtask.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStageDto } from './dto/update-task-stage.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  // add/create task
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() dto: CreateTaskDto, @Req() req: any) {
    const userId = req.user.id as string;
    console.log(userId);
    return await this.taskService.create(dto, userId);
  }

  // update a task
  @Put('update/:id')
  @HttpCode(200)
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    try {
      console.log(id);
      await this.taskService.updateTask(id, updateTaskDto);
      return {
        status: true,
        message: 'Task updated successfully.',
      };
    } catch (error) {
      throw new HttpException(error.message as string, HttpStatus.BAD_REQUEST);
    }
  }

  // update task-stage
  @Patch('update-stage/:id')
  @HttpCode(200)
  async updateTaskStage(
    @Param('id') id: string,
    @Body() updateTaskStageDto: UpdateTaskStageDto,
  ) {
    await this.taskService.updateTaskStage(id, updateTaskStageDto);
    return {
      status: true,
      message: 'Task stage changed successfully.',
    };
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

  // update subtask status...
  @Patch('subtasks/status/:taskId/:subTaskId')
  @HttpCode(HttpStatus.OK)
  async updateSubTaskStage(
    @Param('taskId') taskId: string,
    @Param('subTaskId') subTaskId: string,
    @Body('status') status: boolean,
  ) {
    await this.taskService.updateSubTaskStage(taskId, subTaskId, status);

    return {
      status: true,
      message: status
        ? 'Task has been marked completed'
        : 'Task has been marked uncompleted',
    };
  }

  // delete task to the trash
  @Post('trash/:id')
  @HttpCode(HttpStatus.OK)
  async trashTask(@Param('id') id: string) {
    console.log(id);
    await this.taskService.trashTask(id);
    return {
      status: true,
      message: 'Task trashed successfully.',
    };
  }
}
