// src/task/dto/create-subtask.dto.ts

import { Type } from 'class-transformer';
import { IsString, IsDateString, IsOptional, IsDate } from 'class-validator';

export class CreateSubTaskDto {
  @IsString()
  title: string;

  @IsString()
  tag: string;

  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsDateString()
  isCompleted: boolean;
}
