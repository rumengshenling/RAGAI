import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher, Course, Student, College, WarningRecord } from '@/database/entities';

@Injectable()
export class VisualizationService {
    constructor(
        @InjectRepository(Teacher)
        private teacherRepo: Repository<Teacher>,
        @InjectRepository(Course)
        private courseRepo: Repository<Course>,
        @InjectRepository(Student)
        private studentRepo: Repository<Student>,
        @InjectRepository(College)
        private collegeRepo: Repository<College>,
        @InjectRepository(WarningRecord)
        private warningRepo: Repository<WarningRecord>,
    ) { }

    async getOverviewData() {
        const [teacherCount, studentCount, courseCount, collegeCount, warningCount] = await Promise.all([
            this.teacherRepo.count({ where: { status: 'active' } }),
            this.studentRepo.count({ where: { status: 'active' } }),
            this.courseRepo.count(),
            this.collegeRepo.count(),
            this.warningRepo.count({ where: { status: 'pending' } }),
        ]);

        return {
            summary: {
                teacherCount,
                studentCount,
                courseCount,
                collegeCount,
                warningCount,
                teacherStudentRatio: teacherCount > 0 ? (studentCount / teacherCount).toFixed(2) : 0,
            },
            quickStats: {
                avgTeachingScore: await this.getAvgTeachingScore(),
                avgPassRate: await this.getAvgPassRate(),
                avgGPA: await this.getAvgGPA(),
            },
        };
    }

    async getTeachingStats(collegeId?: string, year?: string) {
        const queryBuilder = this.courseRepo.createQueryBuilder('course')
            .leftJoinAndSelect('course.college', 'college')
            .leftJoinAndSelect('course.teacher', 'teacher');

        if (collegeId) {
            queryBuilder.where('course.collegeId = :collegeId', { collegeId });
        }

        const courses = await queryBuilder.getMany();

        // 只保留有成绩的课程来计算平均通过率和平均分
        const coursesWithScores = courses.filter(c => c.studentCount > 0);

        // 按学院统计
        const collegeStats = this.groupByCollege(courses);

        return {
            courseCount: courses.length,
            totalStudents: courses.reduce((sum, c) => sum + c.studentCount, 0),
            avgPassRate: this.calculateAverage(coursesWithScores.map(c => c.passRate)),
            avgScore: this.calculateAverage(coursesWithScores.map(c => c.averageScore)),
            collegeStats,
            courseTypeDistribution: this.groupByCourseType(courses),
        };
    }

    async getTeacherAnalysis(collegeId?: string) {
        const queryBuilder = this.teacherRepo.createQueryBuilder('teacher')
            .leftJoinAndSelect('teacher.college', 'college');

        if (collegeId) {
            queryBuilder.where('teacher.collegeId = :collegeId', { collegeId });
        }

        const teachers = await queryBuilder.getMany();

        return {
            total: teachers.length,
            titleDistribution: this.groupByTitle(teachers),
            educationDistribution: this.groupByEducation(teachers),
            avgResearchOutput: this.calculateAverage(teachers.map(t => t.researchOutput)),
            avgTeachingScore: this.calculateAverage(teachers.map(t => t.teachingScore)),
            topTeachers: teachers
                .sort((a, b) => b.teachingScore - a.teachingScore)
                .slice(0, 10)
                .map(t => ({ name: t.name, score: t.teachingScore, college: t.college?.name })),
        };
    }

    async getStudentAnalysis(collegeId?: string) {
        const students = await this.studentRepo.find({ where: { status: 'active' } });

        return {
            total: students.length,
            genderDistribution: this.groupByGender(students),
            gradeDistribution: this.groupByGrade(students),
            avgGPA: this.calculateAverage(students.map(s => s.gpa)),
            avgEntranceScore: this.calculateAverage(students.map(s => s.entranceScore || 0)),
            gpaDistribution: this.calculateGPADistribution(students),
        };
    }

    async getTrendData(indicator: string, startYear?: string, endYear?: string) {
        // 模拟趋势数据，实际应从历史数据中查询
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

        return {
            indicator,
            data: months.map((month, index) => ({
                month,
                value: Math.random() * 100,
                trend: Math.random() > 0.5 ? 'up' : 'down',
            })),
        };
    }

    async getHeatmapData(type: string) {
        const colleges = await this.collegeRepo.find();

        return {
            type,
            data: colleges.map(college => ({
                name: college.name,
                value: Math.random() * 100,
            })),
        };
    }

    // ˽�и�������
    private async getAvgTeachingScore(): Promise<number> {
        const result = await this.teacherRepo
            .createQueryBuilder('teacher')
            .select('AVG(teacher.teachingScore)', 'avg')
            .getRawOne();
        return parseFloat(result.avg) || 0;
    }

    private async getAvgPassRate(): Promise<number> {
        const result = await this.courseRepo
            .createQueryBuilder('course')
            .select('AVG(course.passRate)', 'avg')
            .where('course.studentCount > 0')  // 只计算有成绩的课程
            .getRawOne();
        return parseFloat(result.avg) || 0;
    }

    private async getAvgGPA(): Promise<number> {
        const result = await this.studentRepo
            .createQueryBuilder('student')
            .select('AVG(student.gpa)', 'avg')
            .getRawOne();
        return parseFloat(result.avg) || 0;
    }

    private groupByCollege(courses: Course[]) {
        const grouped: any = {};
        courses.forEach(course => {
            const collegeName = course.college?.name || '未知学院';
            if (!grouped[collegeName]) {
                grouped[collegeName] = { count: 0, students: 0 };
            }
            grouped[collegeName].count++;
            grouped[collegeName].students += course.studentCount;
        });
        return grouped;
    }

    private groupByCourseType(courses: Course[]) {
        const types: any = { required: 0, elective: 0, public: 0 };
        courses.forEach(course => {
            types[course.courseType] = (types[course.courseType] || 0) + 1;
        });
        return types;
    }

    private groupByTitle(teachers: Teacher[]) {
        const titles: any = {};
        teachers.forEach(t => {
            titles[t.title] = (titles[t.title] || 0) + 1;
        });
        return titles;
    }

    private groupByEducation(teachers: Teacher[]) {
        const edu: any = {};
        teachers.forEach(t => {
            const education = t.education || '未知';
            edu[education] = (edu[education] || 0) + 1;
        });
        return edu;
    }

    private groupByGender(students: Student[]) {
        return {
            male: students.filter(s => s.gender === 'male').length,
            female: students.filter(s => s.gender === 'female').length,
        };
    }

    private groupByGrade(students: Student[]) {
        const grades: any = {};
        students.forEach(s => {
            grades[s.grade] = (grades[s.grade] || 0) + 1;
        });
        return grades;
    }

    private calculateGPADistribution(students: Student[]) {
        const ranges = [
            { label: '4.0-3.5', min: 3.5, max: 4.0, count: 0 },
            { label: '3.5-3.0', min: 3.0, max: 3.5, count: 0 },
            { label: '3.0-2.5', min: 2.5, max: 3.0, count: 0 },
            { label: '2.5-2.0', min: 2.0, max: 2.5, count: 0 },
            { label: '2.0����', min: 0, max: 2.0, count: 0 },
        ];

        students.forEach(s => {
            const gpa = s.gpa || 0;
            for (const range of ranges) {
                if (gpa >= range.min && gpa < range.max) {
                    range.count++;
                    break;
                }
            }
        });

        return ranges;
    }

    private calculateAverage(values: number[]): number {
        if (values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
}
