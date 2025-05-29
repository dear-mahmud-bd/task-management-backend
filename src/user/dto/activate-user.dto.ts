// src/user/dto/activate-user.dto.ts
import { IsBoolean } from 'class-validator';

export class ActivateUserDto {
  @IsBoolean()
  isActive: boolean;
}
