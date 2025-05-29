/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Res,
  UseGuards,
  Put,
  Req,
  HttpException,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ActivateUserDto } from './dto/activate-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Create/Register a user
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  // Login a user
  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    const result = await this.userService.login(loginDto, res);
    return res.json(result);
  }

  // Get all teams (all-members)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // update profile...
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const { userId, isAdmin } = req.user;
    const { _id } = updateUserDto;

    const id =
      isAdmin && userId === _id
        ? userId
        : isAdmin && userId !== _id
          ? _id
          : userId;

    const updatedUser = await this.userService.updateUserProfile(
      id,
      updateUserDto,
    );

    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      status: true,
      message: 'Profile Updated Successfully.',
      user: updatedUser,
    };
  }

  // update password
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const userId = (req.user as any).userId;
    return await this.userService.changeUserPassword(userId, dto);
  }

  // Activate User Profile...
  @UseGuards(JwtAuthGuard) // optional
  @Patch(':id/activate')
  async activateUser(@Param('id') id: string, @Body() dto: ActivateUserDto) {
    return await this.userService.activateUserProfile(id, dto);
  }
}
