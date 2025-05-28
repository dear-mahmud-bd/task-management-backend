/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/task.schema';

@Injectable()
export class TaskService {
  constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}

  async create(createTaskDto: CreateTaskDto, userId: string) {
    const { title, team, stage, date, priority, assets, links, description } =
      createTaskDto;

    try {
      // Validate team array
      if (!Array.isArray(team) || team.length === 0) {
        throw new BadRequestException('Team must be a non-empty array');
      }
      // Construct activity log
      let text = 'New task has been assigned to you';
      if (team.length > 1) {
        text += ` and ${team.length - 1} others.`;
      }
      text += ` The task priority is set as ${priority}, and the task date is ${new Date(date).toDateString()}. Thank you!`;
      const activity = {
        type: 'assigned',
        activity: text,
        by: userId,
        date: new Date(),
      };

      // Parse links if string (should already be an array if DTO is correct)
      // const newLinks = Array.isArray(links) ? links : links?.split(',') || [];

      // Create task
      const task = await this.taskModel.create({
        title,
        date,
        priority: priority,
        stage: stage,
        activities: [activity],
        description,
        assets,
        links: links,
        team,
      });

      return task;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Task creation failed:', error);
      throw new InternalServerErrorException('Task creation failed');
    }
  }

  findAll() {
    return `This action returns all task`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
