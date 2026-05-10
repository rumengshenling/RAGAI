import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '@/database/entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    console.log('validateUser called with username:', username);
    const user = await this.userRepo.findOne({ where: { username } });
    console.log('Found user:', user);
    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('用户不存在');
    }

    console.log('User password:', user.password);
    console.log('Input password:', password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Password invalid');
      throw new UnauthorizedException('密码错误');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        realName: user.realName,
      },
    };
  }

  async register(registerDto: any) {
    const { username, password, email, realName, role } = registerDto;

    // 检查用户是否已存在
    const existingUser = await this.userRepo.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepo.create({
      username,
      password: hashedPassword,
      email,
      realName,
      role: role || 'teacher',
      isActive: true,
    });

    await this.userRepo.save(user);

    return {
      message: '注册成功',
      userId: user.id,
    };
  }

  async refreshToken(user: any) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
