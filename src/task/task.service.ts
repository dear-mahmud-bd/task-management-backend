/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Notification } from 'src/notification/schemas/notification.schema';
import { CreateSubTaskDto } from './dto/create-subtask.dto';

@Injectable()
export class TaskService {
  // constructor(@InjectModel(Task.name) private taskModel: Model<Task>) {}
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
  ) {}

  // create a task...
  async create(createTaskDto: CreateTaskDto, userId: string) {
    const {
      title,
      team = [],
      stage = 'todo',
      date = new Date(),
      priority = 'normal',
      assets = [],
      links = [],
      description,
    } = createTaskDto;
    console.log('Create Task-> ', createTaskDto);
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

      // Create task
      const task = await this.taskModel.create({
        title,
        team: team.map((id) => new Types.ObjectId(id)),
        stage: stage.toLowerCase(),
        date,
        priority: priority.toLowerCase(),
        assets,
        links,
        description,
        activities: [activity],
      });

      await this.notificationModel.create({
        team: team.map((id) => new Types.ObjectId(id)),
        text,
        task: task._id,
      });

      await this.userModel.updateMany(
        { _id: { $in: team } },
        { $push: { tasks: task._id } },
      );

      return {
        status: true,
        task,
        message: 'Task created successfully.',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Task creation failed:', error);
      throw new InternalServerErrorException('Task creation failed');
    }
  }

  // add task activities...
  async postTaskActivity(
    taskId: string,
    userId: string,
    type: string,
    activity: string,
  ) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new BadRequestException('Task not found');
    }
    const data = {
      type,
      activity,
      date: new Date(),
      by: new Types.ObjectId(userId),
    };

    task.activities.push(data);
    await task.save();
    return {
      status: true,
      message: 'Activity posted successfully.',
    };
  }

  // get dashboard statistics...
  async getDashboardStatistics(user: { userId: string; isAdmin: boolean }) {
    const { userId, isAdmin } = user;

    const allTasks = isAdmin
      ? await this.taskModel
          .find({ isTrashed: false })
          .populate({ path: 'team', select: 'name role title email' })
          .sort({ _id: -1 })
          .exec()
      : await this.taskModel
          .find({ isTrashed: false, team: { $all: [userId] } })
          .populate({ path: 'team', select: 'name role title email' })
          .sort({ _id: -1 })
          .exec();

    const users = isAdmin
      ? await this.userModel
          .find({ isActive: true })
          .select('name title role isActive createdAt')
          .limit(10)
          .sort({ _id: -1 })
          .exec()
      : [];

    const groupedTasks = allTasks.reduce((result, task) => {
      const stage = task.stage;
      result[stage] = (result[stage] || 0) + 1;
      return result;
    }, {});

    const graphData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;
        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {}),
    ).map(([name, total]) => ({ name, total }));

    return {
      totalTasks: allTasks.length,
      last10Task: allTasks.slice(0, 10),
      users,
      tasks: groupedTasks,
      graphData,
    };
  }

  // get all task (filter without filter)
  async getTasks(user: { userId: string; isAdmin: boolean }, filters: any) {
    const { userId, isAdmin } = user;
    const { stage, isTrashed, search } = filters;

    let query: any = {
      isTrashed: isTrashed === 'true' ? true : false,
    };

    if (!isAdmin) {
      query.team = { $all: [userId] };
    }

    if (stage) {
      query.stage = stage;
    }

    if (search) {
      const searchQuery = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { stage: { $regex: search, $options: 'i' } },
          { priority: { $regex: search, $options: 'i' } },
        ],
      };
      query = { ...query, ...searchQuery };
    }

    const tasks = await this.taskModel
      .find(query)
      .populate({
        path: 'team',
        select: 'name title email',
      })
      .sort({ _id: -1 });

    return tasks;
  }

  // get single task
  async getTaskById(id: string) {
    try {
      const task = await this.taskModel
        .findById(id)
        .populate({
          path: 'team',
          select: 'name title role email',
        })
        // .populate({
        //   path: 'activities',
        //   select: 'name',
        // })
        .sort({ _id: -1 });

      return task;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch task',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // add sub tasks
  async addSubTask(
    taskId: string,
    subTaskDto: CreateSubTaskDto,
  ): Promise<void> {
    const task = await this.taskModel.findById(taskId);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const newSubTask = {
      ...subTaskDto,
      isCompleted: false,
    };

    task.subTasks.push(newSubTask);
    await task.save();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
