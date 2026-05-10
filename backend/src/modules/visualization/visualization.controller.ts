import {
    Controller,
    Get,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VisualizationService } from './visualization.service';

@ApiTags('可视化驾驶舱')
@ApiBearerAuth()
@Controller('visualization')
export class VisualizationController {
    constructor(private readonly visualizationService: VisualizationService) { }

    @Get('overview')
    @ApiOperation({ summary: '获取总览数据' })
    async getOverview() {
        return this.visualizationService.getOverviewData();
    }

    @Get('teaching')
    @ApiOperation({ summary: '获取教学数据统计' })
    async getTeachingStats(
        @Query('collegeId') collegeId?: string,
        @Query('year') year?: string,
    ) {
        return this.visualizationService.getTeachingStats(collegeId, year);
    }

    @Get('teachers')
    @ApiOperation({ summary: '获取师资结构分析' })
    async getTeacherAnalysis(@Query('collegeId') collegeId?: string) {
        return this.visualizationService.getTeacherAnalysis(collegeId);
    }

    @Get('students')
    @ApiOperation({ summary: '获取生源质量分析' })
    async getStudentAnalysis(@Query('collegeId') collegeId?: string) {
        return this.visualizationService.getStudentAnalysis(collegeId);
    }

    @Get('trends')
    @ApiOperation({ summary: '获取趋势数据' })
    async getTrends(
        @Query('indicator') indicator: string,
        @Query('startYear') startYear?: string,
        @Query('endYear') endYear?: string,
    ) {
        return this.visualizationService.getTrendData(indicator, startYear, endYear);
    }

    @Get('heatmap')
    @ApiOperation({ summary: '获取热力图数据' })
    async getHeatmap(@Query('type') type: string) {
        return this.visualizationService.getHeatmapData(type);
    }
}
