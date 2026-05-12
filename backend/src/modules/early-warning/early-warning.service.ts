import {
    Injectable,
    Logger,
    OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { WarningRecord, Teacher, Course, Student, StudentScore } from '@/database/entities';

/**
 * 学生学分预警阈值配置
 */
const CREDIT_WARNING_THRESHOLDS = {
    BLUE: 10,    // 蓝色预警：10学分及以上未获得
    YELLOW: 20,  // 黄色预警：20学分及以上未获得
    RED: 30,     // 红色预警：30学分及以上未获得
};

/**
 * 教育预警指标配置
 */
const EDUCATION_INDICATORS: Record<string, any> = {
    // 师资结构指标
    TEACHER_STUDENT_RATIO: {
        name: '师生比',
        type: 'teacher',
        standard: 18, // 标准18:1
        comparison: '<=',
        description: '普通高校师生比应≥18:1',
    },
    PROFESSOR_RATIO: {
        name: '教授占比',
        type: 'teacher',
        standard: 30, // 标准30%
        comparison: '>=',
        description: '专任教师中教授占比应≥30%',
    },
    PHD_RATIO: {
        name: '博士学位教师占比',
        type: 'teacher',
        standard: 50, // 标准50%
        comparison: '>=',
        description: '专任教师中博士学位占比应≥50%',
    },

    // 教学质量指标
    COURSE_PASS_RATE: {
        name: '课程合格率',
        type: 'teaching',
        standard: 90, // 标准90%
        comparison: '>=',
        description: '课程考试合格率应≥90%',
    },
    TEACHING_SCORE: {
        name: '教学评分均值',
        type: 'teaching',
        standard: 80, // 标准80分
        comparison: '>=',
        description: '教师教学评分均值应≥80分',
    },

    // 生源质量指标
    ENTRANCE_SCORE: {
        name: '入学成绩均值',
        type: 'student',
        standard: 500, // 标准值
        comparison: '>=',
        description: '高考平均成绩',
    },
    GPA_DISTRIBUTION: {
        name: '学生GPA均值',
        type: 'student',
        standard: 2.8, // GPA标准值≥2.8
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
        @InjectRepository(StudentScore)
        private scoreRepo: Repository<StudentScore>,
    ) { }

    async onModuleInit() {
        // ��ʼ����ֵ����
        Object.entries(EDUCATION_INDICATORS).forEach(([key, value]) => {
            this.thresholds.set(key, value);
        });
        this.logger.log('Ԥ��ָ����ϵ��ʼ�����');
    }

    /**
     * ��ȡԤ����ʻ������
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
     * 获取所有预警指标
     */
    async getAllIndicators() {
        const indicators = [];
        for (const [key, value] of this.thresholds.entries()) {
            const currentValue = await this.calculateIndicatorValue(key);
            // 格式化数值，保留两位小数，null则为0
            const formattedValue = currentValue !== null && currentValue !== undefined 
                ? parseFloat(currentValue.toFixed(2)) 
                : 0;
            indicators.push({
                code: key,
                ...value,
                currentValue: formattedValue,
                status: this.evaluateIndicator(key, currentValue),
            });
        }
        return indicators;
    }

    /**
     * �������ָ��
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
     * ��ȡԤ����¼�б�
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
     * ��ȡԤ������
     */
    async getWarningDetail(id: string) {
        return this.warningRepo.findOne({ where: { id } });
    }

    /**
     * �������
     */
    async analyzeCauses(id: string) {
        const warning = await this.warningRepo.findOne({ where: { id } });
        if (!warning) return null;

        // �򻯵Ĺ�������߼�
        const causes = await this.analyzeRootCauses(warning);

        warning.causeAnalysis = causes.summary;
        warning.suggestions = causes.suggestions;
        await this.warningRepo.save(warning);

        return causes;
    }

    /**
     * ����ָ����ֵ
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

        return { success: false, message: 'ָ�겻����' };
    }

    /**
     * ��ȡ��ֵ����
     */
    async getThresholds() {
        const configs: any[] = [];
        for (const [key, value] of this.thresholds.entries()) {
            configs.push({ code: key, ...value });
        }
        return configs;
    }

    // ˽�и�������
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
                    where: { status: 'active', title: '����' }
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
        // �򻯵Ĺ��������ʵ��Ӧ���пɼ���AI������
        const causes: string[] = [];

        if (warning.indicatorName === '�γ̺ϸ���') {
            causes.push('����ԭ�򣺿γ��Ѷ����ò�����');
            causes.push('����ԭ�򣺽�ѧ������Ҫ�Ľ�');
            causes.push('����ԭ��ѧ����������');
        } else if (warning.indicatorName === '��ʦ��') {
            causes.push('����ԭ�򣺽�ʦ��������');
            causes.push('����ԭ��ѧ�����й���');
        }

        return {
            summary: causes.join('\n'),
            suggestions: '���������ϸ���в��ƶ�����ԸĽ���ʩ',
            rootCauses: causes,
        };
    }

    private async generateSuggestions(indicatorCode: string, currentValue: number): Promise<string> {
        const config = this.thresholds.get(indicatorCode);
        if (!config) return '';

        if (config.comparison === '>=') {
            if (currentValue < config.standard * 0.8) {
                return 'ָ�����ز���꣬����������ȡ�ж�';
            } else if (currentValue < config.standard) {
                return 'ָ��ӽ�����ߣ������ǿ���͸Ľ�';
            }
        } else if (config.comparison === '<=') {
            if (currentValue > config.standard * 1.2) {
                return 'ָ�����س��꣬������������';
            } else if (currentValue > config.standard) {
                return 'ָ��ӽ������ߣ������ȡ��ʩ';
            }
        }

        return '���������Ⲣ���ֵ�ǰˮƽ';
    }

    /**
     * 检查学生学分预警（核心方法）
     */
    async checkStudentCreditWarnings() {
        const students = await this.studentRepo.find({ where: { status: 'active' } });
        const warnings: WarningRecord[] = [];

        for (const student of students) {
            const failedCredits = await this.calculateFailedCredits(student.studentId);
            
            if (failedCredits > 0) {
                const warningLevel = this.determineWarningLevel(failedCredits);
                const existingWarning = await this.warningRepo.findOne({
                    where: {
                        indicatorType: 'student',
                        studentId: student.studentId,
                        status: 'pending',
                    },
                });

                if (!existingWarning || existingWarning.warningLevel !== warningLevel) {
                    const warning = this.warningRepo.create({
                        indicatorName: '学分预警',
                        indicatorType: 'student',
                        currentValue: failedCredits,
                        threshold: this.getThresholdByLevel(warningLevel),
                        warningLevel,
                        description: `${student.name}（学号：${student.studentId}）未获得学分${failedCredits}分，触发${this.getLevelName(warningLevel)}预警`,
                        studentId: student.studentId,
                        collegeId: undefined,
                        suggestions: this.generateCreditSuggestions(warningLevel, failedCredits),
                    });
                    const savedWarning = await this.warningRepo.save(warning);
                    warnings.push(savedWarning);
                }
            }
        }

        return {
            checkedCount: students.length,
            warningCount: warnings.length,
            warnings,
        };
    }

    /**
     * 获取所有学生预警记录
     */
    async getStudentWarningRecords(query: any) {
        const { page = 1, limit = 20, level } = query;

        const queryBuilder = this.warningRepo.createQueryBuilder('warning')
            .where('warning.indicatorType = :type', { type: 'student' })
            .orderBy('warning.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (level) queryBuilder.andWhere('warning.warningLevel = :level', { level });

        const [records, total] = await queryBuilder.getManyAndCount();

        // 获取学生详细信息
        const detailedRecords = await Promise.all(records.map(async (record) => {
            const student = await this.studentRepo.findOne({ where: { studentId: record.studentId } });
            const failedCredits = record.studentId ? await this.calculateFailedCredits(record.studentId) : 0;
            const failedCourses = await this.getFailedCourses(record.studentId);
            
            return {
                ...record,
                studentInfo: student,
                failedCredits,
                failedCourses,
            };
        }));

        return {
            records: detailedRecords,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    /**
     * 获取单个学生预警详情
     */
    async getStudentWarningDetail(id: string) {
        const record = await this.warningRepo.findOne({ where: { id } });
        if (!record) return null;

        const student = await this.studentRepo.findOne({ where: { studentId: record.studentId } });
        const failedCredits = await this.calculateFailedCredits(record.studentId);
        const failedCourses = await this.getFailedCourses(record.studentId);

        return {
            ...record,
            studentInfo: student,
            failedCredits,
            failedCourses,
        };
    }

    /**
     * 获取预警学生列表（用于预警页面）
     */
    async getWarningStudentList() {
        const students = await this.studentRepo.find({ where: { status: 'active' } });
        
        const warningStudents = [];
        
        for (const student of students) {
            const failedCredits = await this.calculateFailedCredits(student.studentId);
            if (failedCredits >= CREDIT_WARNING_THRESHOLDS.BLUE) {
                const warningLevel = this.determineWarningLevel(failedCredits);
                const failedCourses = await this.getFailedCourses(student.studentId);
                
                warningStudents.push({
                    studentId: student.studentId,
                    name: student.name,
                    gender: student.gender,
                    major: student.major,
                    grade: student.grade,
                    className: student.class,
                    failedCredits,
                    warningLevel,
                    warningLevelName: this.getLevelName(warningLevel),
                    failedCourses,
                });
            }
        }

        // 按预警等级排序（红色优先）
        warningStudents.sort((a, b) => {
            const levelOrder = { critical: 0, danger: 1, warning: 2, info: 3 };
            return levelOrder[a.warningLevel] - levelOrder[b.warningLevel];
        });

        return warningStudents;
    }

    /**
     * 计算学生未获得的学分
     */
    private async calculateFailedCredits(studentId: string): Promise<number> {
        // 先通过学号查询学生的 UUID id
        const student = await this.studentRepo.findOne({ where: { studentId } });
        if (!student) {
            return 0;
        }

        // 使用 QueryBuilder 查询未通过的成绩，同时获取课程信息
        const failedScores = await this.scoreRepo
            .createQueryBuilder('score')
            .leftJoinAndSelect('score.course', 'course')
            .where('score.studentId = :studentId', { studentId: student.id })
            .andWhere('score.score >= :minScore AND score.score <= :maxScore', { minScore: 0, maxScore: 59.99 })
            .getMany();

        // 计算未获得的学分总和
        let totalFailedCredits = 0;
        for (const score of failedScores) {
            if (score.course) {
                totalFailedCredits += Number(score.course.credits);
            } else {
                // 如果课程关联失败，尝试单独查询
                const course = await this.courseRepo.findOne({ where: { id: score.courseId } });
                if (course) {
                    totalFailedCredits += Number(course.credits);
                }
            }
        }

        return totalFailedCredits;
    }

    /**
     * 获取学生未通过的课程列表
     */
    private async getFailedCourses(studentId: string) {
        // 先通过学号查询学生的 UUID id
        const student = await this.studentRepo.findOne({ where: { studentId } });
        if (!student) {
            return [];
        }

        // 使用 QueryBuilder 查询未通过的成绩，同时获取课程信息
        const failedScores = await this.scoreRepo
            .createQueryBuilder('score')
            .leftJoinAndSelect('score.course', 'course')
            .where('score.studentId = :studentId', { studentId: student.id })
            .andWhere('score.score >= :minScore AND score.score <= :maxScore', { minScore: 0, maxScore: 59.99 })
            .getMany();

        const result = [];
        for (const score of failedScores) {
            let courseCode = score.courseId;
            let courseName = '未知课程';
            let credits = 0;

            if (score.course) {
                // 如果关联的课程存在，使用课程信息
                courseCode = score.course.code;
                courseName = score.course.name;
                credits = Number(score.course.credits);
            } else {
                // 如果课程不存在，尝试通过 courseId 查询课程
                const course = await this.courseRepo.findOne({ where: { id: score.courseId } });
                if (course) {
                    courseCode = course.code;
                    courseName = course.name;
                    credits = Number(course.credits);
                }
            }

            result.push({
                courseCode,
                courseName,
                credits,
                score: Number(score.score),
                semester: score.semester,
                academicYear: score.academicYear,
            });
        }

        return result;
    }

    /**
     * 根据未获得学分确定预警等级
     */
    private determineWarningLevel(failedCredits: number): 'warning' | 'danger' | 'critical' {
        if (failedCredits >= CREDIT_WARNING_THRESHOLDS.RED) {
            return 'critical'; // 红色预警
        } else if (failedCredits >= CREDIT_WARNING_THRESHOLDS.YELLOW) {
            return 'danger'; // 黄色预警
        } else if (failedCredits >= CREDIT_WARNING_THRESHOLDS.BLUE) {
            return 'warning'; // 蓝色预警
        }
        return 'warning';
    }

    /**
     * 根据预警等级获取阈值
     */
    private getThresholdByLevel(level: string): number {
        switch (level) {
            case 'critical': return CREDIT_WARNING_THRESHOLDS.RED;
            case 'danger': return CREDIT_WARNING_THRESHOLDS.YELLOW;
            case 'warning': return CREDIT_WARNING_THRESHOLDS.BLUE;
            default: return CREDIT_WARNING_THRESHOLDS.BLUE;
        }
    }

    /**
     * 获取预警等级名称
     */
    private getLevelName(level: string): string {
        const names: Record<string, string> = {
            critical: '红色',
            danger: '黄色',
            warning: '蓝色',
            info: '信息',
        };
        return names[level] || '未知';
    }

    /**
     * 生成学分预警建议
     */
    private generateCreditSuggestions(level: string, failedCredits: number): string {
        switch (level) {
            case 'critical':
                return `严重预警：未获得学分${failedCredits}分（≥30分）。建议：1. 立即联系学业导师制定重修计划；2. 参加学业辅导中心的帮扶课程；3. 考虑申请学业预警帮扶。`;
            case 'danger':
                return `黄色预警：未获得学分${failedCredits}分（≥20分）。建议：1. 尽快重修未通过课程；2. 合理安排学习时间；3. 定期与导师沟通学习进度。`;
            case 'warning':
                return `蓝色预警：未获得学分${failedCredits}分（≥10分）。建议：1. 关注未通过课程的补考安排；2. 加强学习，争取下次通过；3. 如有困难及时寻求帮助。`;
            default:
                return '请关注学业情况，及时处理未通过课程。';
        }
    }

    /**
     * 查询单个学生的学分详情
     */
    async getStudentCreditDetail(studentId: string) {
        const student = await this.studentRepo.findOne({
            where: { studentId },
        });

        if (!student) {
            return null;
        }

        const failedCredits = await this.calculateFailedCredits(studentId);
        const failedCourses = await this.getFailedCourses(studentId);
        const warningLevel = this.determineWarningLevel(failedCredits);

        return {
            ...student,
            failedCredits,
            warningLevel: failedCredits >= 10 ? warningLevel : null,
            failedCourses,
        };
    }
}
