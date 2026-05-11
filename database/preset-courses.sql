-- ================================================
-- 课程预设数据 - 6位数字代码，顺序递增
-- ================================================

-- 公共基础课（100001-100016）
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('高等数学A（上）', '100001', '01', '000000', 5.0, 80, 'required', 120, 85.00, 72.50) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('高等数学A（下）', '100002', '01', '000000', 5.0, 80, 'required', 120, 83.00, 70.20) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('线性代数', '100003', '01', '000000', 3.0, 48, 'required', 120, 88.00, 75.30) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('概率论与数理统计', '100004', '01', '000000', 3.0, 48, 'required', 120, 82.00, 71.80) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学物理A', '100005', '01', '000000', 4.0, 64, 'required', 100, 80.00, 68.50) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学英语（一）', '100006', '01', '000000', 2.0, 32, 'required', 150, 95.00, 82.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学英语（二）', '100007', '01', '000000', 2.0, 32, 'required', 150, 93.00, 80.50) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学英语（三）', '100008', '01', '000000', 2.0, 32, 'required', 150, 90.00, 78.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学英语（四）', '100009', '01', '000000', 2.0, 32, 'required', 150, 88.00, 76.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学体育（一）', '100010', '01', '000000', 1.0, 32, 'required', 200, 98.00, 90.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学体育（二）', '100011', '01', '000000', 1.0, 32, 'required', 200, 98.00, 90.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('思想道德与法治', '100012', '01', '000000', 3.0, 48, 'required', 150, 96.00, 85.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('中国近现代史纲要', '100013', '01', '000000', 3.0, 48, 'required', 150, 95.00, 84.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('马克思主义基本原理', '100014', '01', '000000', 3.0, 48, 'required', 150, 94.00, 83.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('毛泽东思想和中国特色社会主义理论体系概论', '100015', '01', '000000', 4.0, 64, 'required', 150, 93.00, 82.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学计算机基础', '100016', '01', '000000', 2.0, 32, 'required', 120, 92.00, 80.00) ON CONFLICT (code) DO NOTHING;

-- 计算机学院（200001-200014）
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('数据结构', '200001', '01', '000000', 4.0, 64, 'required', 80, 78.00, 72.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('算法设计与分析', '200002', '01', '000000', 3.0, 48, 'required', 80, 75.00, 68.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('离散数学', '200003', '01', '000000', 3.0, 48, 'required', 80, 82.00, 75.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('数据库原理', '200004', '01', '000000', 3.0, 48, 'required', 80, 80.00, 74.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('操作系统', '200005', '01', '000000', 4.0, 64, 'required', 80, 76.00, 70.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('计算机网络', '200006', '01', '000000', 3.0, 48, 'required', 80, 78.00, 72.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('软件工程', '200007', '01', '000000', 3.0, 48, 'required', 80, 82.00, 76.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('面向对象程序设计', '200008', '01', '000000', 4.0, 64, 'required', 80, 85.00, 78.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('计算机组成原理', '200009', '01', '000000', 4.0, 64, 'required', 80, 74.00, 68.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('编译原理', '200010', '01', '000000', 3.0, 48, 'required', 60, 70.00, 65.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('Web应用开发', '200011', '01', '000000', 3.0, 48, 'elective', 60, 88.00, 80.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('人工智能导论', '200012', '01', '000000', 2.0, 32, 'elective', 60, 90.00, 82.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('机器学习', '200013', '01', '000000', 3.0, 48, 'elective', 50, 85.00, 78.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('深度学习', '200014', '01', '000000', 3.0, 48, 'elective', 50, 82.00, 75.00) ON CONFLICT (code) DO NOTHING;

-- 软件工程（200101-200108）
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('软件测试', '200101', '01', '000000', 2.0, 32, 'required', 70, 86.00, 78.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('软件架构设计', '200102', '01', '000000', 3.0, 48, 'required', 70, 80.00, 74.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('UML建模', '200103', '01', '000000', 2.0, 32, 'required', 70, 84.00, 76.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('Java程序设计', '200104', '01', '000000', 4.0, 64, 'required', 70, 88.00, 80.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('Python程序设计', '200105', '01', '000000', 3.0, 48, 'elective', 60, 90.00, 82.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('敏捷开发方法', '200106', '01', '000000', 2.0, 32, 'elective', 60, 88.00, 82.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('微服务架构', '200107', '01', '000000', 2.0, 32, 'elective', 50, 82.00, 76.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('DevOps实践', '200108', '01', '000000', 2.0, 32, 'elective', 50, 85.00, 78.00) ON CONFLICT (code) DO NOTHING;

-- 人工智能（200201-200208）
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('神经网络与深度学习', '200201', '01', '000000', 4.0, 64, 'required', 50, 80.00, 74.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('计算机视觉', '200202', '01', '000000', 3.0, 48, 'required', 50, 82.00, 76.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('自然语言处理', '200203', '01', '000000', 3.0, 48, 'required', 50, 78.00, 72.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('模式识别', '200204', '01', '000000', 3.0, 48, 'required', 50, 76.00, 70.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('强化学习', '200205', '01', '000000', 3.0, 48, 'elective', 40, 78.00, 72.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('知识图谱', '200206', '01', '000000', 2.0, 32, 'elective', 40, 85.00, 78.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('语音识别', '200207', '01', '000000', 2.0, 32, 'elective', 40, 80.00, 74.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('机器人学', '200208', '01', '000000', 3.0, 48, 'elective', 40, 78.00, 72.00) ON CONFLICT (code) DO NOTHING;

-- 数据科学（200301-200308）
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('统计学基础', '200301', '01', '000000', 3.0, 48, 'required', 60, 88.00, 80.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('数据挖掘', '200302', '01', '000000', 3.0, 48, 'required', 60, 80.00, 74.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大数据技术', '200303', '01', '000000', 3.0, 48, 'required', 60, 82.00, 76.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('数据分析与可视化', '200304', '01', '000000', 3.0, 48, 'required', 60, 85.00, 78.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('分布式系统', '200305', '01', '000000', 3.0, 48, 'required', 50, 76.00, 70.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('数据仓库', '200306', '01', '000000', 2.0, 32, 'elective', 50, 82.00, 76.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('云计算技术', '200307', '01', '000000', 2.0, 32, 'elective', 50, 80.00, 74.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('机器学习', '200308', '01', '000000', 3.0, 48, 'required', 60, 83.00, 76.00) ON CONFLICT (code) DO NOTHING;

-- 通识选修（300001-300015）
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('创新创业基础', '300001', '01', '000000', 2.0, 32, 'public', 200, 95.00, 88.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('职业生涯规划', '300002', '01', '000000', 1.0, 16, 'public', 200, 98.00, 90.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('心理健康教育', '300003', '01', '000000', 1.0, 16, 'public', 200, 99.00, 92.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('军事理论', '300004', '01', '000000', 2.0, 32, 'public', 200, 97.00, 88.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('大学生安全教育', '300005', '01', '000000', 1.0, 16, 'public', 200, 99.00, 94.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('形势与政策', '300006', '01', '000000', 2.0, 32, 'public', 200, 96.00, 86.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('音乐鉴赏', '300007', '01', '000000', 2.0, 32, 'public', 100, 98.00, 90.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('美术鉴赏', '300008', '01', '000000', 2.0, 32, 'public', 100, 98.00, 90.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('中国传统文化', '300009', '01', '000000', 2.0, 32, 'public', 150, 96.00, 88.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('商务礼仪', '300010', '01', '000000', 2.0, 32, 'public', 100, 95.00, 86.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('公共演讲与口才', '300011', '01', '000000', 2.0, 32, 'public', 80, 92.00, 84.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('法律基础', '300012', '01', '000000', 2.0, 32, 'public', 150, 94.00, 85.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('经济学原理', '300013', '01', '000000', 2.0, 32, 'public', 120, 88.00, 80.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('管理学基础', '300014', '01', '000000', 2.0, 32, 'public', 120, 90.00, 82.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO courses (name, code, collegeId, teacherId, credits, hours, courseType, studentCount, passRate, averageScore) VALUES ('环境科学概论', '300015', '01', '000000', 2.0, 32, 'public', 100, 96.00, 88.00) ON CONFLICT (code) DO NOTHING;

-- 查看结果
SELECT COUNT(*) AS total_courses FROM courses;
