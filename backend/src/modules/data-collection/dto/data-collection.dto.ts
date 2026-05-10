import { IsString, IsOptional, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum DataType {
    TEACHER = 'teacher',
    COURSE = 'course',
    STUDENT = 'student',
    SCORE = 'score',
}

export class ImportDataDto {
    @ApiProperty({ description: '数据类型', enum: DataType })
    @IsEnum(DataType)
    dataType: DataType;

    @ApiProperty({ description: '数据内容', type: 'array' })
    @IsArray()
    data: any[];
}

export class ValidateDataDto {
    @ApiProperty({ description: '数据类型', enum: DataType })
    @IsEnum(DataType)
    dataType: DataType;

    @ApiProperty({ description: '待验证数据', type: 'array' })
    @IsArray()
    data: any[];
}

export class TeacherDataDto {
    @ApiProperty({ description: '姓名' })
    @IsString()
    name: string;

    @ApiProperty({ description: '工号', required: false })
    @IsOptional()
    @IsString()
    employeeId?: string;

    @ApiProperty({ description: '学院ID' })
    @IsString()
    collegeId: string;

    @ApiProperty({ description: '职称' })
    @IsString()
    title: string;

    @ApiProperty({ description: '学历', required: false })
    @IsOptional()
    @IsString()
    education?: string;

    @ApiProperty({ description: '科研产出', required: false })
    @IsOptional()
    @IsNumber()
    researchOutput?: number;

    @ApiProperty({ description: '教学评分', required: false })
    @IsOptional()
    @IsNumber()
    teachingScore?: number;
}

export class CourseDataDto {
    @ApiProperty({ description: '课程名称' })
    @IsString()
    name: string;

    @ApiProperty({ description: '课程代码', required: false })
    @IsOptional()
    @IsString()
    code?: string;

    @ApiProperty({ description: '学院ID' })
    @IsString()
    collegeId: string;

    @ApiProperty({ description: '教师ID' })
    @IsString()
    teacherId: string;

    @ApiProperty({ description: '学分' })
    @IsNumber()
    credits: number;

    @ApiProperty({ description: '学时' })
    @IsNumber()
    hours: number;

    @ApiProperty({ description: '课程类型', required: false })
    @IsOptional()
    @IsString()
    courseType?: string;

    @ApiProperty({ description: '学生数', required: false })
    @IsOptional()
    @IsNumber()
    studentCount?: number;
}
