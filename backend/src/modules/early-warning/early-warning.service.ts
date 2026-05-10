import {
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { WarningRecord, Teacher, Course, Student } from '@/database/entities';

/**
 * 教育部评估指标体系
 */
const EDUCATION_INDICATORS: Record<string, any> = {
    // 师资结构指标
    TEACHER_STUDENT_RATIO: {
        name: '生师比',
        type: 'teacher',
        standard: 18, // 不高于18:1
        comparison: '<=',
        description: '普通高校生师比应不高于18:1',
    },
    PROFESSOR_RATIO: {
        name: '教授占比',
        type: 'teacher',
        standard: 30, // 不低于30%
        comparison: '>=',
        description: '专任教师中教授占比应不低于30%',
    },
    PHD_RATIO: {
        name: '博士学位教师占比',
        type: 'teacher',
        standard: 50, // 不低于50%
        comparison: '>=',
        description: '专任教师中博士学位占比应不低于50%',
    },

    // 教学质量指标
    COURSE_PASS_RATE: {
        name: '课程合格率',
        type: 'teaching',
        standard: 90, // 不低于90%
        comparison: '>=',
        description: '课程考核合格率应不低于90%',
    },
    TEACHING_SCORE: {
        name: '教学评分均值',
        type: 'teaching',
        standard: 80, // 不低于80分
        comparison: '>=',
        description: '教师教学评分均值应不低于80分',
    },

    // 生源质量指标
    ENTRANCE_SCORE: {
        name: '新生入学成绩均值',
        type: 'student',
        standard: 500, // 示例值
        comparison: '>=',
        description: '新生高考成绩均值',
    },
    GPA_DISTRIBUTION: {
        name: '学生GPA分布',
        type: 'student',
        standard: 2.8, // GPA均值不低于2.8
        comparison: '>=',
        description: '学生平均GPA',
    },
};

@Injectable()
export class EarlyWarningService implements OnModuleInit {
    private readonly logger = new Logger(EarlyWarningService.name);
    private thresholds = new Map<string, any>();

    constructor(
        @InjectRepository(WarningRecord)
        private warningRepo: Repository<WarningRecord>,
        @InjectRepository(Teacher)
        private teacherRepo: Repository<Teacher>,
        @InjectRepository(Course)
        private courseRepo: Repository<Course>,
        @InjectRepository(Student)
        private studentRepo: Repository<Student>,
    ) { }

    async onModuleInit() {
        // 初始化阈值配置
        Object.entries(EDUCATION_INDICATORS).forEach(([key, value]) => {
            this.thresholds.set(key, value);
        });
        this.logger.log('预警指标体系初始化完成');
    }

    /**
     * 获取预警驾驶舱数据
     */
    async getDashboardData() {
        const [
            totalWarnings,
            criticalCount,
            dangerCount,
            warningCount,
            recentWarnings,
            indicatorStats,
        ] = await Promise.all([
            this.warningRepo.count(),
            this.warningRepo.count({ where: { warningLevel: 'critical' } }),
            this.warningRepo.count({ where: { warningLevel: 'danger' } }),
            this.warningRepo.count({ where: { warningLevel: 'warning' } }),
            this.warningRepo.find({
                order: { createdAt: 'DESC' },
                take: 10,
            }),
            this.getIndicatorStatistics(),
        ]);

        return {
            summary: {
                total: totalWarnings,
                critical: criticalCount,
                danger: dangerCount,
                warning: warningCount,
                info: totalWarnings - criticalCount - dangerCount - warningCount,
            },
            recentWarnings,
            indicatorStats,
            trends: await this.getWarningTrends(),
        };
    }

    /**
     * 获取所有监测指标
     */
    async getAllIndicators() {
        const indicators = [];
        for (const [key, value] of this.thresholds.entries()) {
            const currentValue = await this.calculateIndicatorValue(key);
            indicators.push({
                code: key,
                ...value,
                currentValue,
                status: this.evaluateIndicator(key, currentValue),
            });
        }
        return indicators;
    }

    /**
     * 检查所有指标
     */
    async checkAllIndicators() {
        const warnings: WarningRecord[] = [];

        for (const [key, config] of this.thresholds.entries()) {
            const currentValue = await this.calculateIndicatorValue(key);
            const status = this.evaluateIndicator(key, currentValue);

            if (status !== 'normal') {
                const warning = this.warningRepo.create({
                    indicatorName: config.name,
                    indicatorType: config.type,
                    currentValue,
                    threshold: config.standard,
                    warningLevel: this.mapStatusToLevel(status),
                    description: config.description,
                    suggestions: await this.generateSuggestions(key, currentValue),
                });
                warnings.push(await this.warningRepo.save(warning));
            }
        }

        return {
            checkedCount: this.thresholds.size,
            warningCount: warnings.length,
            warnings,
        };
    }

    /**
     * 获取预警记录列表
     */
    async getWarningRecords(query: any) {
        const { page = 1, limit = 20, level, type, status } = query;

        const queryBuilder = this.warningRepo.createQueryBuilder('warning')
            .orderBy('warning.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (level) queryBuilder.andWhere('warning.warningLevel = :level', { level });
        if (type) queryBuilder.andWhere('warning.indicatorType = :type', { type });
        if (status) queryBuilder.andWhere('warning.status = :status', { status });

        const [records, total] = await queryBuilder.getManyAndCount();

        return {
            records,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * 获取预警详情
     */
    async getWarningDetail(id: string) {
        return this.warningRepo.findOne({ where: { id } });
    }

    /**
     * 归因分析
     */
    async analyzeCauses(id: string) {
        const warning = await this.warningRepo.findOne({ where: { id } });
        if (!warning) return null;

        // 简化的归因分析逻辑
        const causes = await this.analyzeRootCauses(warning);

        warning.causeAnalysis = causes.summary;
        warning.suggestions = causes.suggestions;
        await this.warningRepo.save(warning);

        return causes;
    }

    /**
     * 设置指标阈值
     */
    async setThreshold(dto: any) {
        const { indicatorCode, threshold, description } = dto;

        if (this.thresholds.has(indicatorCode)) {
            const config = this.thresholds.get(indicatorCode);
            config.standard = threshold;
            config.description = description || config.description;
            this.thresholds.set(indicatorCode, config);
            return { success: true, config };
        }

        return { success: false, message: '指标不存在' };
    }

    /**
     * 获取阈值配置
     */
    async getThresholds() {
        const configs: any[] = [];
        for (const [key, value] of this.thresholds.entries()) {
            configs.push({ code: key, ...value });
        }
        return configs;
    }

    // 私有辅助方法
    private async calculateIndicatorValue(indicatorCode: string): Promise<number> {
        switch (indicatorCode) {
            case 'TEACHER_STUDENT_RATIO': {
                const teacherCount = await this.teacherRepo.count({ where: { status: 'active' } });
                const studentCount = await this.studentRepo.count({ where: { status: 'active' } });
                return teacherCount > 0 ? studentCount / teacherCount : 0;
            }

            case 'PROFESSOR_RATIO': {
                const total = await this.teacherRepo.count({ where: { status: 'active' } });
                const professors = await this.teacherRepo.count({
                    where: { status: 'active', title: '教授' }
                });
                return total > 0 ? (professors / total) * 100 : 0;
            }

            case 'COURSE_PASS_RATE': {
                const courses = await this.courseRepo.find();
                if (courses.length === 0) return 0;
                const avgPassRate = courses.reduce((sum, c) => sum + c.passRate, 0) / courses.length;
                return avgPassRate;
            }

            case 'TEACHING_SCORE': {
                const teachers = await this.teacherRepo.find();
                if (teachers.length === 0) return 0;
                return teachers.reduce((sum, t) => sum + t.teachingScore, 0) / teachers.length;
            }

            case 'GPA_DISTRIBUTION': {
                const students = await this.studentRepo.find();
                if (students.length === 0) return 0;
                return students.reduce((sum, s) => sum + s.gpa, 0) / students.length;
            }

            default:
                return 0;
        }
    }

    private evaluateIndicator(code: string, value: number): string {
        const config = this.thresholds.get(code);
        if (!config) return 'normal';

        const { comparison, standard } = config;

        switch (comparison) {
            case '<=':
                return value <= standard ? 'normal' : (value <= standard * 1.1 ? 'warning' : 'danger');
            case '>=':
                return value >= standard ? 'normal' : (value >= standard * 0.9 ? 'warning' : 'danger');
            default:
                return 'normal';
        }
    }

    private mapStatusToLevel(status: string): 'warning' | 'danger' | 'critical' {
        const mapping: Record<string, 'warning' | 'danger'> = {
            warning: 'warning',
            danger: 'danger'
        };
        return mapping[status] || 'warning';
    }

    private async getIndicatorStatistics() {
        const stats: any[] = [];
        for (const [key] of this.thresholds.entries()) {
            const value = await this.calculateIndicatorValue(key);
            stats.push({ indicator: key, value });
        }
        return stats;
    }

    private async getWarningTrends() {
        const last7Days = await this.warningRepo
            .createQueryBuilder('w')
            .select("DATE_TRUNC('day', w.createdAt)", 'date')
            .addSelect('COUNT(*)', 'count')
            .where('w.createdAt >= :startDate', {
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            })
            .groupBy("DATE_TRUNC('day', w.createdAt)")
            .orderBy("DATE_TRUNC('day', w.createdAt)", 'ASC')
            .getRawMany();

        return last7Days;
    }

    private async analyzeRootCauses(warning: WarningRecord): Promise<any> {
        // 简化的归因分析（实际应用中可集成AI分析）
        const causes: string[] = [];

        if (warning.indicatorName === '课程合格率') {
            causes.push('可能原因：课程难度设置不合理');
            causes.push('可能原因：教学方法需要改进');
            causes.push('可能原因：学生基础薄弱');
        } else if (warning.indicatorName === '生师比') {
            causes.push('可能原因：教师引进不足');
            causes.push('可能原因：学生扩招过快');
        }

        return {
            summary: causes.join('\n'),
            suggestions: '建议进行详细调研并制定针对性改进措施',
            rootCauses: causes,
        };
    }

    private async generateSuggestions(indicatorCode: string, currentValue: number): Promise<string> {
        const config = this.thresholds.get(indicatorCode);
        if (!config) return '';

        if (config.comparison === '>=') {
            if (currentValue < config.standard * 0.8) {
                return '指标严重不达标，建议立即采取行动';
            } else if (currentValue < config.standard) {
                return '指标接近达标线，建议加强监测和改进';
            }
        } else if (config.comparison === '<=') {
            if (currentValue > config.standard * 1.2) {
                return '指标严重超标，建议立即调整';
            } else if (currentValue > config.standard) {
                return '指标接近警戒线，建议采取措施';
            }
        }

        return '建议持续监测并保持当前水平';
    }
}
