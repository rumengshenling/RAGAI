import {
    Entity,
    PrimaryGeneratedColumn,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';

/**
 * �û�ʵ��
 */
@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    realName: string;

    @Column({ default: 'teacher' })
    role: 'admin' | 'supervisor' | 'college_head' | 'teacher';

    @Column({ type: 'varchar', length: 2, nullable: true })
    collegeId: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    permissions: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * ѧԺʵ��
 */
@Entity('colleges')
export class College {
    @PrimaryColumn({ type: 'varchar', length: 2 })
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    code: string;

    @Column({ nullable: true })
    dean: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Teacher, (teacher) => teacher.college)
    teachers: Teacher[];

    @OneToMany(() => Course, (course) => course.college)
    courses: Course[];
}

/**
 * ��ʦʵ��
 */
@Entity('teachers')
export class Teacher {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar', length: 6, unique: true })
    employeeId: string;

    @ManyToOne(() => College, (college) => college.teachers)
    @JoinColumn({ name: 'collegeId' })
    college: College;

    @Column({ type: 'varchar', length: 2 })
    collegeId: string;

    @Column()
    title: string; // ְ�ƣ����ڡ������ڡ���ʦ������

    @Column({ nullable: true })
    education: string; // ѧ������ʿ��˶ʿ������

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    researchOutput: number; // ���в���������������

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    teachingScore: number; // ��ѧ����

    @Column({ type: 'int', default: 0 })
    courseCount: number; // �ڿ�����

    @Column({ type: 'date', nullable: true })
    hireDate: Date;

    @Column({ default: 'active' })
    status: 'active' | 'retired' | 'on_leave';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Course, (course) => course.teacher)
    courses: Course[];
}

/**
 * �γ�ʵ��
 */
@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar', length: 6, unique: true })
    code: string;

    @ManyToOne(() => College, (college) => college.courses)
    @JoinColumn({ name: 'collegeId' })
    college: College;

    @Column({ type: 'varchar', length: 2 })
    collegeId: string;

    @ManyToOne(() => Teacher, (teacher) => teacher.courses)
    @JoinColumn({ name: 'teacherId', referencedColumnName: 'employeeId' })
    teacher: Teacher;

    @Column()
    teacherId: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    credits: number;

    @Column({ type: 'int', default: 0 })
    hours: number;

    @Column({ default: 'required' })
    courseType: 'required' | 'elective' | 'public';

    @Column({ type: 'int', default: 0 })
    studentCount: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    passRate: number; // ������

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    averageScore: number; // ƽ����

    @Column({ type: 'text', nullable: true })
    syllabus: string; // ��ѧ���

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => StudentScore, (score) => score.course)
    studentScores: StudentScore[];
}

/**
 * ѧ��ʵ��
 */
@Entity('students')
export class Student {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    studentId: string;

    @Column()
    gender: 'male' | 'female';

    @Column({ type: 'date' })
    birthDate: Date;

    @Column({ type: 'date' })
    enrollmentDate: Date;

    @Column()
    major: string;

    @Column()
    grade: string;

    @Column({ nullable: true })
    class: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    gpa: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    entranceScore: number; // ��ѧ�ɼ�

    @Column({ default: 'active' })
    status: 'active' | 'graduated' | 'suspended' | 'dropped_out';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => StudentScore, (score) => score.student)
    studentScores: StudentScore[];
}

/**
 * ѧ���ɼ�ʵ��
 */
@Entity('student_scores')
export class StudentScore {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Student, (student) => student.studentScores)
    @JoinColumn({ name: 'studentId' })
    student: Student;

    @Column()
    studentId: string;

    @ManyToOne(() => Course, (course) => course.studentScores)
    @JoinColumn({ name: 'courseId', referencedColumnName: 'code' })
    course: Course;

    @Column()
    courseId: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    score: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    usualScore: number; // ƽʱ�ɼ�

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    examScore: number; // ���Գɼ�

    @Column({ type: 'varchar', length: 20 })
    semester: string; // ѧ�ڣ�2023-2024-1

    @Column({ type: 'varchar', length: 20 })
    academicYear: string; // ѧ�꣺2023-2024

    @Column({ default: 'normal' })
    examType: 'normal' | 'makeup' | 'retake'; // ��������

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * Ԥ����¼ʵ��
 */
@Entity('warning_records')
export class WarningRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    indicatorName: string; // ָ������

    @Column()
    indicatorType: 'teaching' | 'teacher' | 'student' | 'resource'; // ָ������

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    currentValue: number; // ��ǰֵ

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    threshold: number; // ��ֵ

    @Column()
    warningLevel: 'info' | 'warning' | 'danger' | 'critical'; // Ԥ���ȼ�

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: true })
    causeAnalysis: string; // ԭ�����

    @Column({ type: 'text', nullable: true })
    suggestions: string; // ���Ľ���

    @Column({ type: 'varchar', length: 2, nullable: true })
    collegeId: string;

    @Column({ default: 'pending' })
    status: 'pending' | 'processing' | 'resolved';

    @Column({ type: 'jsonb', nullable: true })
    relatedData: any; // ��������

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * ���ݵ����¼ʵ��
 */
@Entity('data_import_records')
export class DataImportRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fileName: string;

    @Column({ nullable: true })
    fileSize: number;

    @Column()
    dataType: 'course' | 'teacher' | 'student' | 'score';

    @Column({ default: 'pending' })
    status: 'pending' | 'processing' | 'success' | 'failed' | 'partial';

    @Column({ type: 'int', default: 0 })
    totalCount: number;

    @Column({ type: 'int', default: 0 })
    successCount: number;

    @Column({ type: 'int', default: 0 })
    failedCount: number;

    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    @Column({ type: 'jsonb', nullable: true })
    validationErrors: any[];

    @Column()
    operatorId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}

/**
 * ������־ʵ��
 */
@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({ nullable: true })
    username: string;

    @Column()
    action: string;

    @Column({ nullable: true })
    resource: string;

    @Column({ nullable: true })
    resourceId: string;

    @Column({ type: 'jsonb', nullable: true })
    oldValue: any;

    @Column({ type: 'jsonb', nullable: true })
    newValue: any;

    @Column({ nullable: true })
    ip: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ default: true })
    success: boolean;

    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    @CreateDateColumn()
    createdAt: Date;
}
