// src/task/dto/post-activity.dto.ts
import { IsEnum, IsString } from 'class-validator';

export class PostActivityDto {
  @IsEnum([
    'assigned',
    'started',
    'in_progress',
    'bug',
    'completed',
    'commented',
  ])
  type: string;

  @IsString()
  activity: string;
}
