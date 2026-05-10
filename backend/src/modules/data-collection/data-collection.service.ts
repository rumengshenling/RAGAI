import {
    Injectable,
    BadRequestException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as ExcelJS from 'exceljs';
import {
    Teacher,
    Course,
    Student,
    StudentScore,
    DataImportRecord,
} from '@/database/entities';

@Injectable()
export class DataCollectionService {
    private readonly logger = new Logger(DataCollectionService.name);

    constructor(
        @InjectRepository(Teacher)
        private teacherRepo: Repository<Teacher>,
        @InjectRepository(Course)
        private courseRepo: Repository<Course>,
        @InjectRepository(Student)
        private studentRepo: Repository<Student>,
        @InjectRepository(StudentScore)
        private scoreRepo: Repository<StudentScore>,
        @InjectRepository(DataImportRecord)
        private importRecordRepo: Repository<DataImportRecord>,
        private dataSource: DataSource,
    ) { }

    /**
     * �����ʦ����
     */
    async importTeachers(file: Express.Multer.File) {
        const record = await this.createImportRecord('teacher', file);

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer as any);
            const worksheet = workbook.worksheets[0];

            const teachers: any[] = [];
            const errors: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // ������ͷ

                try {
                    const teacher = {
                        name: row.getCell(1).value?.toString() || '',
                        employeeId: row.getCell(2).value?.toString() || '',
                        collegeId: row.getCell(3).value?.toString() || '',
                        title: row.getCell(4).value?.toString() || '',
                        education: row.getCell(5).value?.toString() || '',
                        researchOutput: parseFloat(row.getCell(6).value?.toString() || '0'),
                        teachingScore: parseFloat(row.getCell(7).value?.toString() || '0'),
                    };

                    const validationErrors = this.validateTeacher(teacher);
                    if (validationErrors.length > 0) {
                        errors.push({ row: rowNumber, data: teacher, errors: validationErrors });
                    } else {
                        teachers.push(teacher);
                    }
                } catch (error) {
                    errors.push({ row: rowNumber, error: String(error) });
                }
            });

            if (teachers.length > 0) {
                await this.dataSource.transaction(async (manager) => {
                    for (const teacher of teachers) {
                        await manager.save(Teacher, teacher);
                    }
                });
            }

            record.status = (errors.length === 0 ? 'success' : 'failed') as any;
            record.totalCount = teachers.length + errors.length;
            record.successCount = teachers.length;
            record.failedCount = errors.length;
            record.validationErrors = errors;
            await this.importRecordRepo.save(record);

            return {
                importId: record.id,
                total: record.totalCount,
                success: teachers.length,
                failed: errors.length,
                errors: errors.slice(0, 10),
            };
        } catch (error) {
            record.status = 'failed';
            record.errorMessage = String(error);
            await this.importRecordRepo.save(record);
            throw new BadRequestException(`导入失败: ${error}`);
        }
    }

    /**
     * ����γ�����
     */
    async importCourses(file: Express.Multer.File) {
        const record = await this.createImportRecord('course', file);

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer as any);
            const worksheet = workbook.worksheets[0];

            const courses: any[] = [];
            const errors: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                try {
                    const course = {
                        name: row.getCell(1).value?.toString() || '',
                        code: row.getCell(2).value?.toString() || '',
                        collegeId: row.getCell(3).value?.toString() || '',
                        teacherId: row.getCell(4).value?.toString() || '',
                        credits: parseFloat(row.getCell(5).value?.toString() || '0'),
                        hours: parseInt(row.getCell(6).value?.toString() || '0'),
                        courseType: row.getCell(7).value?.toString() || 'required',
                        studentCount: parseInt(row.getCell(8).value?.toString() || '0'),
                    };

                    const validationErrors = this.validateCourse(course);
                    if (validationErrors.length > 0) {
                        errors.push({ row: rowNumber, data: course, errors: validationErrors });
                    } else {
                        courses.push(course);
                    }
                } catch (error) {
                    errors.push({ row: rowNumber, error: String(error) });
                }
            });

            if (courses.length > 0) {
                await this.dataSource.transaction(async (manager) => {
                    for (const course of courses) {
                        await manager.save(Course, course);
                    }
                });
            }

            record.status = (errors.length === 0 ? 'success' : 'failed') as any;
            record.totalCount = courses.length + errors.length;
            record.successCount = courses.length;
            record.failedCount = errors.length;
            record.validationErrors = errors;
            await this.importRecordRepo.save(record);

            return {
                importId: record.id,
                total: record.totalCount,
                success: courses.length,
                failed: errors.length,
                errors: errors.slice(0, 10),
            };
        } catch (error) {
            record.status = 'failed';
            record.errorMessage = String(error);
            await this.importRecordRepo.save(record);
            throw new BadRequestException(`导入失败: ${error}`);
        }
    }

    /**
     * ����ѧ������
     */
    async importStudents(file: Express.Multer.File) {
        const record = await this.createImportRecord('student', file);

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer as any);
            const worksheet = workbook.worksheets[0];

            const students: any[] = [];
            const errors: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                try {
                    // 获取原始值
                    const name = row.getCell(1).value?.toString() || '';
                    const studentId = row.getCell(2).value?.toString() || '';
                    const gender = row.getCell(3).value?.toString() || '';
                    const birthDateStr = row.getCell(4).value?.toString() || '';
                    const enrollmentDateStr = row.getCell(5).value?.toString() || '';
                    const major = row.getCell(6).value?.toString() || '';
                    const grade = row.getCell(7).value?.toString() || '';
                    const classStr = row.getCell(8).value?.toString() || '';
                    const entranceScore = parseFloat(row.getCell(9).value?.toString() || '0');
                    
                    // 构建验证对象，使用原始字符串进行验证
                    const studentForValidation = {
                        name,
                        studentId,
                        gender,
                        birthDate: birthDateStr,
                        enrollmentDate: enrollmentDateStr,
                        major,
                        grade,
                        class: classStr,
                        entranceScore,
                    };
                    
                    // 验证
                    const validationErrors = this.validateStudent(studentForValidation);
                    
                    // 转换性别值：男 -> male，女 -> female
                    const genderValue = gender === '男' ? 'male' : gender === '女' ? 'female' : gender;
                    
                    // 如果验证通过，构建实际的学生对象
                    const student = {
                        name,
                        studentId,
                        gender: genderValue,
                        birthDate: this.parseDate(birthDateStr),
                        enrollmentDate: this.parseDate(enrollmentDateStr),
                        major,
                        grade,
                        class: classStr,
                        entranceScore,
                    };
                    if (validationErrors.length > 0) {
                        errors.push({ row: rowNumber, data: student, errors: validationErrors });
                    } else {
                        students.push(student);
                    }
                } catch (error) {
                    errors.push({ row: rowNumber, error: String(error) });
                }
            });

            if (students.length > 0) {
                await this.dataSource.transaction(async (manager) => {
                    for (const student of students) {
                        // 检查学号是否已存在
                        const existingStudent = await manager.findOne(Student, {
                            where: { studentId: student.studentId }
                        });
                        if (existingStudent) {
                            // 如果学号已存在，更新学生信息
                            await manager.update(Student, existingStudent.id, student);
                        } else {
                            // 如果学号不存在，插入新学生
                            await manager.save(Student, student);
                        }
                    }
                });
            }

            record.status = (errors.length === 0 ? 'success' : 'failed') as any;
            record.totalCount = students.length + errors.length;
            record.successCount = students.length;
            record.failedCount = errors.length;
            record.validationErrors = errors;
            await this.importRecordRepo.save(record);

            return {
                importId: record.id,
                total: record.totalCount,
                success: students.length,
                failed: errors.length,
                errors: errors.slice(0, 10),
            };
        } catch (error) {
            record.status = 'failed';
            record.errorMessage = String(error);
            await this.importRecordRepo.save(record);
            throw new BadRequestException(`导入失败: ${error}`);
        }
    }

    /**
     * ����ɼ�����
     */
    async importScores(file: Express.Multer.File) {
        const record = await this.createImportRecord('score', file);

        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer as any);
            const worksheet = workbook.worksheets[0];

            const scores: any[] = [];
            const errors: any[] = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;

                try {
                    const score = {
                        studentId: row.getCell(1).value?.toString() || '',
                        courseId: row.getCell(2).value?.toString() || '',
                        score: parseFloat(row.getCell(3).value?.toString() || '0'),
                        usualScore: parseFloat(row.getCell(4).value?.toString() || '0'),
                        examScore: parseFloat(row.getCell(5).value?.toString() || '0'),
                        semester: row.getCell(6).value?.toString() || '',
                        academicYear: row.getCell(7).value?.toString() || '',
                        examType: row.getCell(8).value?.toString() || 'normal',
                    };

                    const validationErrors = this.validateScore(score);
                    if (validationErrors.length > 0) {
                        errors.push({ row: rowNumber, data: score, errors: validationErrors });
                    } else {
                        scores.push(score);
                    }
                } catch (error) {
                    errors.push({ row: rowNumber, error: String(error) });
                }
            });

            if (scores.length > 0) {
                await this.dataSource.transaction(async (manager) => {
                    for (const score of scores) {
                        await manager.save(StudentScore, score);
                    }
                });
            }

            record.status = (errors.length === 0 ? 'success' : 'failed') as any;
            record.totalCount = scores.length + errors.length;
            record.successCount = scores.length;
            record.failedCount = errors.length;
            record.validationErrors = errors;
            await this.importRecordRepo.save(record);

            return {
                importId: record.id,
                total: record.totalCount,
                success: scores.length,
                failed: errors.length,
                errors: errors.slice(0, 10),
            };
        } catch (error) {
            record.status = 'failed';
            record.errorMessage = String(error);
            await this.importRecordRepo.save(record);
            throw new BadRequestException(`导入失败: ${error}`);
        }
    }

    /**
     * ��֤���ݸ�ʽ
     */
    async validateData(validateDto: any) {
        const { dataType, data } = validateDto;
        let validator: Function;

        switch (dataType) {
            case 'teacher':
                validator = this.validateTeacher;
                break;
            case 'course':
                validator = this.validateCourse;
                break;
            case 'student':
                validator = this.validateStudent;
                break;
            case 'score':
                validator = this.validateScore;
                break;
            default:
                throw new BadRequestException('��֧�ֵ���������');
        }

        const errors = data.map((item: any, index: number) => ({
            row: index + 1,
            errors: validator.call(this, item),
        })).filter((item: any) => item.errors.length > 0);

        return {
            valid: errors.length === 0,
            errorCount: errors.length,
            errors: errors.slice(0, 20),
        };
    }

    /**
     * ��ȡ�����¼�б�
     */
    async getImportRecords(page: number, limit: number, dataType?: string) {
        // 确保 page 和 limit 是有效的数字
        const validPage = typeof page === 'number' && !isNaN(page) ? Math.max(1, page) : 1;
        const validLimit = typeof limit === 'number' && !isNaN(limit) ? Math.max(1, Math.min(100, limit)) : 20;
        
        const query = this.importRecordRepo.createQueryBuilder('record')
            .orderBy('record.createdAt', 'DESC')
            .skip((validPage - 1) * validLimit)
            .take(validLimit);

        if (dataType) {
            query.where('record.dataType = :dataType', { dataType });
        }

        const [records, total] = await query.getManyAndCount();

        return {
            records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * ��ȡ�����¼����
     */
    async getImportRecordDetail(id: string) {
        const record = await this.importRecordRepo.findOne({ where: { id } });
        if (!record) {
            throw new NotFoundException('�����¼������');
        }
        return record;
    }

    /**
     * �������ݵ���ģ��
     */
    async generateTemplate(type: string) {
        const workbook = new ExcelJS.Workbook();
        // 设置默认字体为支持中文的字体
        workbook.creator = 'Education Quality Monitor System';
        workbook.lastModifiedBy = 'Education Quality Monitor System';
        workbook.created = new Date();
        workbook.modified = new Date();
        
        const worksheet = workbook.addWorksheet('数据模板');

        const templates: Record<string, string[]> = {
            teachers: ['姓名', '工号', '学院ID', '职称', '学历', '科研产出', '教学评分'],
            courses: ['课程名称', '课程代码', '学院ID', '教师ID', '学分', '学时', '课程类型', '学生数'],
            students: ['姓名', '学号', '性别', '出生日期', '入学日期', '专业', '年级', '班级', '入学成绩'],
            scores: ['学生ID', '课程ID', '总成绩', '平时成绩', '考试成绩', '学期', '学年', '考试类型'],
        };

        const headers = templates[type as keyof typeof templates] || [];
        worksheet.addRow(headers);

        // 设置表头样式
        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { 
                bold: true,
                name: 'Arial Unicode MS' // 使用支持中文的字体
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' },
            };
            cell.alignment = {
                horizontal: 'center',
                vertical: 'middle'
            };
        });

        // 调整列宽
        headers.forEach((_, index) => {
            worksheet.getColumn(index + 1).width = 15;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const nodeBuffer = Buffer.from(buffer as any);
        return {
            fileName: `${type}_template.xlsx`,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            buffer: nodeBuffer.toString('base64'),
        };
    }

    // ˽�з���
    private async createImportRecord(dataType: string, file: Express.Multer.File) {
        const record = this.importRecordRepo.create({
            fileName: file.originalname,
            fileSize: file.size,
            dataType: dataType as any,
            status: 'pending',
            operatorId: '00000000-0000-0000-0000-000000000000', // 使用默认的UUID
        });
        return this.importRecordRepo.save(record);
    }

    private validateTeacher(teacher: any): string[] {
        const errors: string[] = [];
        
        // 验证姓名：两到四个简体中文汉字
        if (!teacher.name) {
            errors.push('姓名不能为空');
        } else if (!/^[\u4e00-\u9fa5]{2,4}$/.test(teacher.name)) {
            errors.push('姓名必须是二到四个简体中文文字');
        }
        
        // 验证工号：六位数阿拉伯数字
        if (!teacher.employeeId) {
            errors.push('工号不能为空');
        } else if (!/^\d{6}$/.test(teacher.employeeId)) {
            errors.push('工号必须是6位数字');
        }
        
        // 验证学院ID：两位阿拉伯数字（可能以0开头）
        if (!teacher.collegeId) {
            errors.push('学院ID不能为空');
        } else if (!/^\d{2}$/.test(teacher.collegeId)) {
            errors.push('学院ID必须是2位数字');
        }
        
        // 验证教学评分：0~100
        if (teacher.teachingScore < 0 || teacher.teachingScore > 100) {
            errors.push('教学评分必须在0-100之间');
        }
        
        return errors;
    }

    private validateCourse(course: any): string[] {
        const errors: string[] = [];
        
        // 验证课程名称：保证能顺利录入
        if (!course.name) {
            errors.push('课程名称不能为空');
        }
        
        // 验证课程代码：六位阿拉伯数字
        if (!course.code) {
            errors.push('课程代码不能为空');
        } else if (!/^\d{6}$/.test(course.code)) {
            errors.push('课程代码必须是6位数字');
        }
        
        // 验证学院ID：两位阿拉伯数字（可能以0开头）
        if (!course.collegeId) {
            errors.push('学院ID不能为空');
        } else if (!/^\d{2}$/.test(course.collegeId)) {
            errors.push('学院ID必须是2位数字');
        }
        
        // 验证教师ID：即工号，六位阿拉伯数字
        if (!course.teacherId) {
            errors.push('教师ID不能为空');
        } else if (!/^\d{6}$/.test(course.teacherId)) {
            errors.push('教师ID必须是6位数字');
        }
        
        // 验证学分：非零的个位数，特殊课程可能有0.5的小数
        if (course.credits <= 0) {
            errors.push('学分必须是非零的正数');
        } else if (!/^\d+(\.5)?$/.test(course.credits.toString())) {
            errors.push('学分必须是个位数，特殊课程可以是0.5的小数');
        }
        
        // 验证学时：两位数阿拉伯数字
        if (!course.hours) {
            errors.push('学时不能为空');
        } else if (!/^\d{2}$/.test(course.hours.toString())) {
            errors.push('学时必须是2位数字');
        }
        
        // 验证课程类型：仅有主修和选修
        if (!course.courseType) {
            errors.push('课程类型不能为空');
        } else if (!['主修', '选修'].includes(course.courseType)) {
            errors.push('课程类型只能是主修或选修');
        }
        
        // 验证学生数：两位阿拉伯数字
        if (!course.studentCount) {
            errors.push('学生数不能为空');
        } else if (!/^\d{2}$/.test(course.studentCount.toString())) {
            errors.push('学生数必须是2位数字');
        }
        
        return errors;
    }

    private validateStudent(student: any): string[] {
        const errors: string[] = [];
        
        // 验证姓名：二到四个简体中文文字
        if (!student.name) {
            errors.push('姓名不能为空');
        } else if (!/^[\u4e00-\u9fa5]{2,4}$/.test(student.name)) {
            errors.push('姓名必须是二到四个简体中文文字');
        }
        
        // 验证学号：12位数
        if (!student.studentId) {
            errors.push('学号不能为空');
        } else if (!/^\d{12}$/.test(student.studentId)) {
            errors.push('学号必须是12位数字');
        }
        
        // 验证性别：只能是男或女
        if (!student.gender) {
            errors.push('性别不能为空');
        } else if (!['男', '女'].includes(student.gender)) {
            errors.push('性别只能是男或女');
        }
        
        // 验证出生日期：8位阿拉伯数字
        if (!student.birthDate) {
            errors.push('出生日期不能为空');
        } else if (!/^\d{8}$/.test(student.birthDate)) {
            errors.push('出生日期必须是8位数字');
        }
        
        // 验证入学日期：8位阿拉伯数字
        if (!student.enrollmentDate) {
            errors.push('入学日期不能为空');
        } else if (!/^\d{8}$/.test(student.enrollmentDate)) {
            errors.push('入学日期必须是8位数字');
        }
        
        // 验证年级：4位阿拉伯数字
        if (!student.grade) {
            errors.push('年级不能为空');
        } else if (!/^\d{4}$/.test(student.grade)) {
            errors.push('年级必须是4位数字');
        }
        
        // 验证班级：一到两位数的阿拉伯数字
        if (student.class && !/^\d{1,2}$/.test(student.class)) {
            errors.push('班级必须是一到两位数字');
        }
        
        // 验证入学成绩：在0~750之间
        if (student.entranceScore !== undefined) {
            const score = parseFloat(student.entranceScore);
            if (isNaN(score) || score < 0 || score > 750) {
                errors.push('入学成绩必须在0~750之间');
            }
        }
        
        return errors;
    }

    private validateScore(score: any): string[] {
        const errors: string[] = [];
        
        // 验证学生ID：即学号，12位数字
        if (!score.studentId) {
            errors.push('学生ID不能为空');
        } else if (!/^\d{12}$/.test(score.studentId)) {
            errors.push('学生ID必须是12位数字');
        }
        
        // 验证课程ID：六位阿拉伯数字
        if (!score.courseId) {
            errors.push('课程ID不能为空');
        } else if (!/^\d{6}$/.test(score.courseId)) {
            errors.push('课程ID必须是6位数字');
        }
        
        // 验证总成绩：0~100中的一个数字
        if (score.score < 0 || score.score > 100) {
            errors.push('总成绩必须在0-100之间');
        }
        
        // 验证平时成绩：0~100中的一个数字
        if (score.usualScore < 0 || score.usualScore > 100) {
            errors.push('平时成绩必须在0-100之间');
        }
        
        // 验证考试成绩：0~100中的一个数字
        if (score.examScore < 0 || score.examScore > 100) {
            errors.push('考试成绩必须在0-100之间');
        }
        
        // 验证学期：只能是1或者2
        if (!score.semester) {
            errors.push('学期不能为空');
        } else if (!['1', '2'].includes(score.semester)) {
            errors.push('学期只能是1或2');
        }
        
        // 验证学年：在1~6之间
        if (!score.academicYear) {
            errors.push('学年不能为空');
        } else {
            const year = parseInt(score.academicYear);
            if (isNaN(year) || year < 1 || year > 6) {
                errors.push('学年必须在1-6之间');
            }
        }
        
        // 验证考试类型：笔试，上机考试和期末实践
        if (!score.examType) {
            errors.push('考试类型不能为空');
        } else if (!['笔试', '上机考试', '期末实践'].includes(score.examType)) {
            errors.push('考试类型只能是笔试、上机考试或期末实践');
        }
        
        return errors;
    }

    // 解析8位数字格式的日期为Date对象
    private parseDate(dateStr: string): Date {
        if (!dateStr || dateStr.length !== 8) {
            return new Date();
        }
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1; // 月份从0开始
        const day = parseInt(dateStr.substring(6, 8));
        return new Date(year, month, day);
    }
}