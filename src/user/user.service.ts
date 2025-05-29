import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';
import { ActivateUserDto } from './dto/activate-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // Create / Registered a user
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.code === 11000) {
        // Duplicate key error
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  // Log-in a user
  async login(loginDto: LoginUserDto, res: Response) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    if (!user.isActive) {
      throw new UnauthorizedException(
        'User account has been deactivated. Contact administrator.',
      );
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    // Create JWT and attach to cookie
    const token = this.jwtService.sign({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    // Optionally: attach token to cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password before sending user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...safeUser } = user.toObject();
    return { status: true, token, user: safeUser };
  }

  // Get all teams (all-members) (admin only)
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userModel.find().select('-password');
    return users;
  }

  // user Updated Profile...
  async updateUserProfile(id: string, dto: UpdateUserDto) {
    const user = await this.userModel.findById(id);
    if (!user) return null;

    user.name = dto.name || user.name;
    user.title = dto.title || user.title;
    user.role = dto.role || user.role;

    const updatedUser = await user.save();
    // updatedUser.password = undefined;
    return updatedUser;
  }

  // update password...
  async changeUserPassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(dto.password, salt);

    await user.save();
    return {
      status: true,
      message: 'Password changed successfully.',
    };
  }

  //activate user Profile...
  async activateUserProfile(id: string, dto: ActivateUserDto) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isActive = dto.isActive;
    await user.save();

    return {
      status: true,
      message: `User account has been ${
        user.isActive ? 'activated' : 'disabled'
      }`,
    };
  }
}
