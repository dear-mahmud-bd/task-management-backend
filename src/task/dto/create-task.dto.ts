// create-task.dto.ts
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsOptional()
  @IsEnum(['high', 'medium', 'normal', 'low'])
  priority?: string;

  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'completed'])
  stage?: string;

  @IsOptional()
  @IsArray()
  team?: string[]; // ObjectId strings

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  assets?: string[];

  @IsOptional()
  @IsArray()
  links?: string[];

  @IsOptional()
  @IsBoolean()
  isTrashed?: boolean;
}
