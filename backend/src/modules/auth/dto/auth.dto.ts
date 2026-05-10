import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: '用户名' })
    @IsString()
    username: string;

    @ApiProperty({ description: '密码' })
    @IsString()
    password: string;
}

export class RegisterDto {
    @ApiProperty({ description: '用户名' })
    @IsString()
    username: string;

    @ApiProperty({ description: '密码' })
    @IsString()
    password: string;

    @ApiProperty({ description: '邮箱' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: '真实姓名', required: false })
    @IsOptional()
    @IsString()
    realName?: string;

    @ApiProperty({
        description: '角色',
        enum: ['admin', 'supervisor', 'college_head', 'teacher'],
        required: false
    })
    @IsOptional()
    @IsEnum(['admin', 'supervisor', 'college_head', 'teacher'])
    role?: string;
}
