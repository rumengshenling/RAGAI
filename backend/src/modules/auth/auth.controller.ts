import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Request as ExpressRequest } from 'express';

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: '用户登录' })
    async login(@Body() loginDto: LoginDto) {
        console.log('Login request received:', loginDto);
        const user = await this.authService.validateUser(loginDto.username, loginDto.password);
        console.log('Validated user:', user);
        return this.authService.login(user);
    }

    @Post('register')
    @ApiOperation({ summary: '用户注册' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Get('profile')
    @ApiOperation({ summary: '获取当前用户信息' })
    @ApiBearerAuth()
    async getProfile(@Request() req: ExpressRequest) {
        return req.user;
    }

    @Post('refresh')
    @ApiOperation({ summary: '刷新Token' })
    @ApiBearerAuth()
    async refreshToken(@Request() req: ExpressRequest) {
        return this.authService.refreshToken(req.user);
    }
}