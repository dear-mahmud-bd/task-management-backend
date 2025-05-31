/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
    // console.log(createUserDto);
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

  // Logout user...
  @Post('logout')
  logoutUser(@Req() req: Request, @Res() res: Response) {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  }

  // Get all teams (all-members)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'developer')
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // update profile...
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    // console.log(updateUserDto);
    const updatedUser = await this.userService.updateUserProfile(
      updateUserDto._id as string,
      updateUserDto,
    );
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      status: true,
      message: 'Profile Updated Successfully.',
      user: {
        name: updatedUser.name,
        title: updatedUser.title,
        role: updatedUser.role,
      },
    };
  }

  // update password
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.id as string;
    return await this.userService.changeUserPassword(userId, dto);
  }

  // Activate User Profile...
  @UseGuards(JwtAuthGuard) // optional
  @Patch('activate/:id')
  async activateUser(@Param('id') id: string, @Body() dto: ActivateUserDto) {
    return await this.userService.activateUserProfile(id, dto);
  }
}
