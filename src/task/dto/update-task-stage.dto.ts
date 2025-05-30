// src/task/dto/update-task-stage.dto.ts
import { IsEnum } from 'class-validator';

export class UpdateTaskStageDto {
  @IsEnum(['todo', 'in_progress', 'completed'], {
    message: 'Stage must be one of: todo, in_progress, completed',
  })
  stage: string;
}
