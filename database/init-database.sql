-- ================================================
-- 高等教育质量监测AI系统 - 数据库初始化脚本
-- PostgreSQL 版本
-- 编码: UTF-8
-- ================================================

-- 连接到 education_monitor 数据库后执行此脚本
-- 如果数据库不存在，请先创建：
-- CREATE DATABASE education_monitor;

-- ================================================
-- 1. 创建表结构
-- ================================================

-- 学院表
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    dean VARCHAR(100),
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 教师表
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    "employeeId" VARCHAR(50),
    "collegeId" UUID REFERENCES colleges(id),
    title VARCHAR(50),
    education VARCHAR(50),
    "researchOutput" DECIMAL(10,2) DEFAULT 0,
    "teachingScore" DECIMAL(5,2) DEFAULT 0,
    "courseCount" INTEGER DEFAULT 0,
    "hireDate" DATE,
    status VARCHAR(20) DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    "collegeId" UUID REFERENCES colleges(id),
    "teacherId" UUID REFERENCES teachers(id),
    credits DECIMAL(5,2) DEFAULT 0,
    hours INTEGER DEFAULT 0,
    "courseType" VARCHAR(20) DEFAULT 'required',
    "studentCount" INTEGER DEFAULT 0,
    "passRate" DECIMAL(5,2) DEFAULT 0,
    "averageScore" DECIMAL(5,2) DEFAULT 0,
    syllabus TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学生表
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    "studentId" VARCHAR(50) UNIQUE NOT NULL,
    gender VARCHAR(10),
    "birthDate" DATE,
    "enrollmentDate" DATE,
    major VARCHAR(100),
    grade VARCHAR(20),
    class VARCHAR(50),
    gpa DECIMAL(5,2) DEFAULT 0,
    "entranceScore" DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 成绩表
CREATE TABLE IF NOT EXISTS student_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID REFERENCES students(id),
    "courseId" UUID REFERENCES courses(id),
    score DECIMAL(5,2),
    "usualScore" DECIMAL(5,2),
    "examScore" DECIMAL(5,2),
    semester VARCHAR(20),
    "academicYear" VARCHAR(20),
    "examType" VARCHAR(20) DEFAULT 'normal',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    "realName" VARCHAR(100),
    role VARCHAR(20) DEFAULT 'teacher',
    "collegeId" UUID,
    "isActive" BOOLEAN DEFAULT TRUE,
    permissions JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 预警记录表
CREATE TABLE IF NOT EXISTS warning_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "indicatorName" VARCHAR(255) NOT NULL,
    "indicatorType" VARCHAR(50),
    "currentValue" DECIMAL(10,2),
    threshold DECIMAL(10,2),
    "warningLevel" VARCHAR(20),
    description TEXT,
    "causeAnalysis" TEXT,
    suggestions TEXT,
    "collegeId" UUID,
    status VARCHAR(20) DEFAULT 'pending',
    "relatedData" JSONB,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 数据导入记录表
CREATE TABLE IF NOT EXISTS data_import_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "fileName" VARCHAR(255),
    "fileSize" INTEGER,
    "dataType" VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    "totalCount" INTEGER DEFAULT 0,
    "successCount" INTEGER DEFAULT 0,
    "failedCount" INTEGER DEFAULT 0,
    "errorMessage" TEXT,
    "validationErrors" JSONB,
    "operatorId" UUID,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID,
    username VARCHAR(100),
    action VARCHAR(255),
    resource VARCHAR(255),
    "resourceId" UUID,
    "oldValue" JSONB,
    "newValue" JSONB,
    ip VARCHAR(50),
    "userAgent" TEXT,
    success BOOLEAN DEFAULT TRUE,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- 2. 创建索引
-- ================================================

CREATE INDEX IF NOT EXISTS idx_teachers_college ON teachers("collegeId");
CREATE INDEX IF NOT EXISTS idx_courses_college ON courses("collegeId");
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses("teacherId");
CREATE INDEX IF NOT EXISTS idx_student_scores_student ON student_scores("studentId");
CREATE INDEX IF NOT EXISTS idx_student_scores_course ON student_scores("courseId");
CREATE INDEX IF NOT EXISTS idx_warning_records_level ON warning_records("warningLevel");
CREATE INDEX IF NOT EXISTS idx_warning_records_type ON warning_records("indicatorType");
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs("userId");
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs("createdAt");

-- ================================================
-- 3. 插入初始管理员账号
-- 密码: admin123456 (使用 bcrypt 加密)
-- ================================================

INSERT INTO users (username, password, email, "realName", role, "isActive")
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq6J7X5.vJ5GvRfFJ5vJ5GvRfFJ5vJ',
    'admin@edu.cn',
    'System Administrator',
    'admin',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- ================================================
-- 4. 插入示例学院数据
-- ================================================

INSERT INTO colleges (name, code, dean, description) VALUES
('Computer Science College', 'CS', 'Prof. Zhang', 'Computer Science and Technology'),
('Software Engineering College', 'SE', 'Prof. Li', 'Software Engineering'),
('AI College', 'AI', 'Prof. Wang', 'Artificial Intelligence'),
('Data Science College', 'DS', 'Prof. Liu', 'Data Science and Big Data')
ON CONFLICT DO NOTHING;

-- ================================================
-- 5. 插入示例教师数据
-- ================================================

INSERT INTO teachers (name, "employeeId", "collegeId", title, education, "researchOutput", "teachingScore", status)
SELECT 
    'Teacher ' || i,
    'T' || LPAD(i::text, 6, '0'),
    (SELECT id FROM colleges ORDER BY RANDOM() LIMIT 1),
    CASE (i % 4)
        WHEN 0 THEN 'Professor'
        WHEN 1 THEN 'Associate Professor'
        WHEN 2 THEN 'Lecturer'
        ELSE 'Assistant'
    END,
    CASE (i % 3)
        WHEN 0 THEN 'PhD'
        WHEN 1 THEN 'Master'
        ELSE 'Bachelor'
    END,
    (RANDOM() * 20)::DECIMAL(10,2),
    (70 + RANDOM() * 30)::DECIMAL(5,2),
    'active'
FROM generate_series(1, 50) i;

-- ================================================
-- 6. 插入示例学生数据
-- ================================================

INSERT INTO students (name, "studentId", gender, "enrollmentDate", major, grade, gpa, "entranceScore", status)
SELECT 
    'Student ' || i,
    'S' || LPAD(i::text, 10, '0'),
    CASE WHEN i % 2 = 0 THEN 'male' ELSE 'female' END,
    CURRENT_DATE - (RANDOM() * 1460)::INTEGER,
    CASE (i % 4)
        WHEN 0 THEN 'Computer Science'
        WHEN 1 THEN 'Software Engineering'
        WHEN 2 THEN 'Artificial Intelligence'
        ELSE 'Data Science'
    END,
    (2020 + (i % 4))::TEXT,
    (2.0 + RANDOM() * 2.0)::DECIMAL(5,2),
    (450 + RANDOM() * 150)::DECIMAL(5,2),
    'active'
FROM generate_series(1, 200) i;

-- ================================================
-- 7. 插入示例课程数据
-- ================================================

INSERT INTO courses (name, code, "collegeId", "teacherId", credits, hours, "courseType", "studentCount", "passRate", "averageScore")
SELECT 
    'Course ' || i,
    'C' || LPAD(i::text, 6, '0'),
    (SELECT id FROM colleges ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM teachers ORDER BY RANDOM() LIMIT 1),
    (1 + RANDOM() * 3)::DECIMAL(5,2),
    (16 + (RANDOM() * 32)::INTEGER),
    CASE (i % 3)
        WHEN 0 THEN 'required'
        WHEN 1 THEN 'elective'
        ELSE 'public'
    END,
    (30 + (RANDOM() * 70)::INTEGER),
    (75 + RANDOM() * 25)::DECIMAL(5,2),
    (65 + RANDOM() * 30)::DECIMAL(5,2)
FROM generate_series(1, 30) i;

-- ================================================
-- 8. 插入示例成绩数据
-- ================================================

INSERT INTO student_scores ("studentId", "courseId", score, "usualScore", "examScore", semester, "academicYear", "examType")
SELECT 
    (SELECT id FROM students ORDER BY RANDOM() LIMIT 1),
    (SELECT id FROM courses ORDER BY RANDOM() LIMIT 1),
    (50 + RANDOM() * 50)::DECIMAL(5,2),
    (60 + RANDOM() * 40)::DECIMAL(5,2),
    (50 + RANDOM() * 50)::DECIMAL(5,2),
    '2023-2024-1',
    '2023-2024',
    'normal'
FROM generate_series(1, 500) i;

-- ================================================
-- 完成
-- ================================================

SELECT 'Database initialization completed!' AS message;

SELECT 
    (SELECT COUNT(*) FROM colleges) AS colleges,
    (SELECT COUNT(*) FROM teachers) AS teachers,
    (SELECT COUNT(*) FROM students) AS students,
    (SELECT COUNT(*) FROM courses) AS courses,
    (SELECT COUNT(*) FROM student_scores) AS scores,
    (SELECT COUNT(*) FROM users) AS users;
