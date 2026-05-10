import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum WarningLevel {
    INFO = 'info',
    WARNING = 'warning',
    DANGER = 'danger',
    CRITICAL = 'critical',
}

export enum IndicatorType {
    TEACHING = 'teaching',
    TEACHER = 'teacher',
    STUDENT = 'student',
    RESOURCE = 'resource',
}

export class CreateWarningThresholdDto {
    @ApiProperty({ description: '指标代码' })
    @IsString()
    indicatorCode: string;

    @ApiProperty({ description: '阈值' })
    @IsNumber()
    threshold: number;

    @ApiProperty({ description: '说明', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}

export class QueryWarningDto {
    @ApiProperty({ description: '页码', required: false, default: 1 })
    @Type(() => Number)
    page?: number = 1;

    @ApiProperty({ description: '每页数量', required: false, default: 20 })
    @Type(() => Number)
    limit?: number = 20;

    @ApiProperty({ description: '预警等级', enum: WarningLevel, required: false })
    @IsOptional()
    @IsEnum(WarningLevel)
    level?: WarningLevel;

    @ApiProperty({ description: '指标类型', enum: IndicatorType, required: false })
    @IsOptional()
    @IsEnum(IndicatorType)
    type?: IndicatorType;

    @ApiProperty({ description: '状态', required: false })
    @IsOptional()
    @IsString()
    status?: string;
}
