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

@ApiTags('Ԥ������')
@ApiBearerAuth()
@Controller('early-warning')
export class EarlyWarningController {
    constructor(private readonly earlyWarningService: EarlyWarningService) { }

    @Get('dashboard')
    @ApiOperation({ summary: '��ȡԤ����ʻ������' })
    async getDashboard(@Query('page') _page?: number, @Query('limit') _limit?: number) {
        return this.earlyWarningService.getDashboardData();
    }

    @Get('indicators')
    @ApiOperation({ summary: '��ȡ���м��ָ��' })
    async getIndicators(@Query('page') _page?: number, @Query('limit') _limit?: number) {
        return this.earlyWarningService.getAllIndicators();
    }

    @Post('thresholds')
    @ApiOperation({ summary: '����ָ����ֵ' })
    async setThreshold(@Body() dto: CreateWarningThresholdDto) {
        return this.earlyWarningService.setThreshold(dto);
    }

    @Get('thresholds')
    @ApiOperation({ summary: '��ȡָ����ֵ����' })
    async getThresholds() {
        return this.earlyWarningService.getThresholds();
    }

    @Get('records')
    @ApiOperation({ summary: '��ȡԤ����¼�б�' })
    async getWarningRecords(@Query() query: QueryWarningDto) {
        return this.earlyWarningService.getWarningRecords(query);
    }

    @Get('records/:id')
    @ApiOperation({ summary: '��ȡԤ����¼����' })
    async getWarningDetail(@Param('id', ParseUUIDPipe) id: string) {
        return this.earlyWarningService.getWarningDetail(id);
    }

    @Post('analyze/:id')
    @ApiOperation({ summary: '���ɹ����������' })
    async analyzeCauses(@Param('id', ParseUUIDPipe) id: string) {
        return this.earlyWarningService.analyzeCauses(id);
    }

    @Post('check')
    @ApiOperation({ summary: '�ֶ�����Ԥ�����' })
    async checkWarnings() {
        return this.earlyWarningService.checkAllIndicators();
    }

    @Get('students')
    @ApiOperation({ summary: '获取预警学生列表' })
    async getWarningStudents() {
        return this.earlyWarningService.getWarningStudentList();
    }

    @Get('student/:studentId')
    @ApiOperation({ summary: '查询学生学分详情' })
    async getStudentDetail(@Param('studentId') studentId: string) {
        return this.earlyWarningService.getStudentCreditDetail(studentId);
    }

    @Get('student-records')
    @ApiOperation({ summary: '获取学生预警记录列表' })
    async getStudentWarningRecords(@Query() query: QueryWarningDto) {
        return this.earlyWarningService.getStudentWarningRecords(query);
    }

    @Get('student-records/:id')
    @ApiOperation({ summary: '获取学生预警记录详情' })
    async getStudentWarningDetail(@Param('id', ParseUUIDPipe) id: string) {
        return this.earlyWarningService.getStudentWarningDetail(id);
    }

    @Post('check-student-credit')
    @ApiOperation({ summary: '检查学生学分预警' })
    async checkStudentCreditWarnings() {
        return this.earlyWarningService.checkStudentCreditWarnings();
    }
}
