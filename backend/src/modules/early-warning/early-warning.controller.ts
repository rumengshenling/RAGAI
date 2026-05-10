import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EarlyWarningService } from './early-warning.service';
import { CreateWarningThresholdDto, QueryWarningDto } from './dto/early-warning.dto';

@ApiTags('预警分析')
@ApiBearerAuth()
@Controller('early-warning')
export class EarlyWarningController {
    constructor(private readonly earlyWarningService: EarlyWarningService) { }

    @Get('dashboard')
    @ApiOperation({ summary: '获取预警驾驶舱数据' })
    async getDashboard() {
        return this.earlyWarningService.getDashboardData();
    }

    @Get('indicators')
    @ApiOperation({ summary: '获取所有监测指标' })
    async getIndicators() {
        return this.earlyWarningService.getAllIndicators();
    }

    @Post('thresholds')
    @ApiOperation({ summary: '设置指标阈值' })
    async setThreshold(@Body() dto: CreateWarningThresholdDto) {
        return this.earlyWarningService.setThreshold(dto);
    }

    @Get('thresholds')
    @ApiOperation({ summary: '获取指标阈值配置' })
    async getThresholds() {
        return this.earlyWarningService.getThresholds();
    }

    @Get('records')
    @ApiOperation({ summary: '获取预警记录列表' })
    async getWarningRecords(@Query() query: QueryWarningDto) {
        return this.earlyWarningService.getWarningRecords(query);
    }

    @Get('records/:id')
    @ApiOperation({ summary: '获取预警记录详情' })
    async getWarningDetail(@Param('id', ParseUUIDPipe) id: string) {
        return this.earlyWarningService.getWarningDetail(id);
    }

    @Post('analyze/:id')
    @ApiOperation({ summary: '生成归因分析报告' })
    async analyzeCauses(@Param('id', ParseUUIDPipe) id: string) {
        return this.earlyWarningService.analyzeCauses(id);
    }

    @Post('check')
    @ApiOperation({ summary: '手动触发预警检查' })
    async checkWarnings() {
        return this.earlyWarningService.checkAllIndicators();
    }
}
