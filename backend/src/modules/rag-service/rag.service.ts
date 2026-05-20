import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Student, Teacher, Course, StudentScore, WarningRecord } from '@/database/entities';

@Injectable()
export class RagService {
    private readonly logger = new Logger(RagService.name);
    private readonly aiServiceUrl: string;
    private documents: any[] = [];
    private readonly axiosInstance: any;

    constructor(
        private configService: ConfigService,
        @InjectRepository(Student) private studentRepo: Repository<Student>,
        @InjectRepository(Teacher) private teacherRepo: Repository<Teacher>,
        @InjectRepository(Course) private courseRepo: Repository<Course>,
        @InjectRepository(StudentScore) private scoreRepo: Repository<StudentScore>,
        @InjectRepository(WarningRecord) private warningRepo: Repository<WarningRecord>,
    ) {
        this.aiServiceUrl = this.configService.get('AI_SERVICE_URL', 'http://localhost:8000');
        this.axiosInstance = axios.create({
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json; charset=utf-8',
            },
        });
    }

    async chat(dto: any) {
        const { question, conversationHistory = [] } = dto;

        try {
            // 1. 先调用AI服务，看是否是FAQ问题
            this.logger.log(`正在查询AI服务: ${question}`);
            const firstResponse = await this.axiosInstance.post(`${this.aiServiceUrl}/chat`, {
                prompt: question,
                model: this.configService.get('AI_MODEL_NAME', 'chatglm3-6b'),
                temperature: 0.7,
                max_tokens: 2000,
            });

            // 检查是否是特殊标志：需要继续查数据库
            if (firstResponse.data.answer === '__NEED_DB_QUERY__') {
                this.logger.log('AI服务判断需要查询数据库，继续执行完整流程');
                
                // 获取知识库文档
                const relevantDocs = await this.semanticSearch(question, 3);
                const docsContext = relevantDocs
                    .map((doc: any) => doc.content)
                    .join('\n\n');

                // 获取数据库数据
                const dbContext = await this.queryDatabase(question);

                // 合并上下文
                const context = [docsContext, dbContext].filter(Boolean).join('\n\n');
                const prompt = this.buildRagPrompt(question, context, conversationHistory);

                // 再次调用AI服务，使用带上下文的prompt
                const finalResponse = await this.axiosInstance.post(`${this.aiServiceUrl}/chat`, {
                    prompt,
                    model: this.configService.get('AI_MODEL_NAME', 'chatglm3-6b'),
                    temperature: 0.7,
                    max_tokens: 2000,
                });

                return {
                    answer: finalResponse.data.answer,
                    sources: relevantDocs.map((doc: any) => ({
                        title: doc.title,
                        relevance: doc.score,
                    })),
                    timestamp: new Date().toISOString(),
                };
            } else {
                // AI服务直接回答了（FAQ或其他），直接返回
                this.logger.log('AI服务直接返回答案');
                return {
                    answer: firstResponse.data.answer,
                    sources: [],
                    timestamp: new Date().toISOString(),
                };
            }
        } catch (error) {
            this.logger.error(`AI服务调用失败: ${error.message}`);
            return {
                answer: '智能问答服务暂时不可用，请稍后重试。',
                sources: [],
                error: true,
            };
        }
    }

    /**
     * 根据问题查询数据库
     */
    private async queryDatabase(question: string): Promise<string> {
        const contexts: string[] = [];

        // 检测问题类型并查询相应数据
        if (this.containsKeywords(question, ['学生', '学号', '学员', '在校生'])) {
            const studentCount = await this.studentRepo.count();
            contexts.push(`学生总数：${studentCount}人`);
        }

        if (this.containsKeywords(question, ['教师', '老师', '教职工', '讲师'])) {
            const teacherCount = await this.teacherRepo.count();
            contexts.push(`教师总数：${teacherCount}人`);
        }

        if (this.containsKeywords(question, ['课程', '科目', '课'])) {
            const courseCount = await this.courseRepo.count();
            contexts.push(`课程总数：${courseCount}门`);
        }

        if (this.containsKeywords(question, ['成绩', '分数', '考试', '学分'])) {
            const scoreCount = await this.scoreRepo.count();
            contexts.push(`成绩记录总数：${scoreCount}条`);
        }

        if (this.containsKeywords(question, ['预警', '警告', '未通过', '不及格'])) {
            const warningCount = await this.warningRepo.count();
            contexts.push(`预警记录总数：${warningCount}条`);
        }

        // 查询特定学生信息、成绩、学分
        const studentIdMatch = question.match(/(\d{12})/);
        if (studentIdMatch) {
            const studentId = studentIdMatch[1];
            const student = await this.studentRepo.findOne({ where: { studentId } });
            
            if (student) {
                // 学生基本信息
                contexts.push(`学生信息：学号${student.studentId}，姓名${student.name}，性别${student.gender === 'male' ? '男' : '女'}，专业${student.major}，年级${student.grade}级，班级${student.class || '未分配'}`);

                // 查询学生成绩（直接关联查询课程）
                const scores = await this.scoreRepo
                    .createQueryBuilder('score')
                    .leftJoinAndSelect('score.course', 'course')
                    .where('score.studentId = :studentId', { studentId: student.id })
                    .getMany();

                if (scores.length > 0) {
                    let totalCredits = 0;
                    let earnedCredits = 0;
                    const scoreDetails = [];
                    
                    for (const score of scores) {
                        const course = score.course;
                        const courseName = course?.name || '未知课程';
                        const courseCode = course?.code || '未知代码';
                        const credits = Number(course?.credits || 0);
                        const scoreValue = Number(score.score);
                        
                        scoreDetails.push(`${courseName}(${courseCode})：${scoreValue}分，学分${credits}`);
                        
                        totalCredits += credits;
                        if (scoreValue >= 60) {
                            earnedCredits += credits;
                        }
                    }
                    
                    contexts.push(`成绩情况：共${scores.length}门课程，${scoreDetails.join('；')}`);
                    contexts.push(`学分情况：总修读学分${totalCredits}，已获得学分${earnedCredits}，未获得学分${totalCredits - earnedCredits}`);
                } else {
                    contexts.push('该学生暂无成绩记录');
                }
            }
        }

        // 查询特定教师信息
        const teacherIdMatch = question.match(/教师(\d{6})|工号(\d{6})/);
        if (teacherIdMatch) {
            const employeeId = teacherIdMatch[1] || teacherIdMatch[2];
            const teacher = await this.teacherRepo.findOne({ where: { employeeId } });
            if (teacher) {
                contexts.push(`教师信息：工号${teacher.employeeId}，姓名${teacher.name}，职称${teacher.title}，学院ID${teacher.collegeId}`);
            }
        }

        return contexts.join('\n');
    }

    /**
     * 检测问题中是否包含关键词
     */
    private containsKeywords(text: string, keywords: string[]): boolean {
        return keywords.some(keyword => text.includes(keyword));
    }

    /**
     * 上传文档到知识库
     */
    async uploadDocument(dto: any) {
        const { title, content, category, tags } = dto;

        // 生成文档向量
        const embedding = await this.generateEmbedding(content);

        const doc = {
            id: Date.now().toString(),
            title,
            content,
            category,
            tags,
            embedding,
            createdAt: new Date(),
        };

        this.documents.push(doc);

        return {
            success: true,
            documentId: doc.id,
            message: '文档已成功添加到知识库',
        };
    }

    /**
     * 语义搜索
     */
    async semanticSearch(query: string, topK: number = 5): Promise<any[]> {
        if (this.documents.length === 0) {
            return [];
        }

        // 生成查询向量
        const queryEmbedding = await this.generateEmbedding(query);

        // 计算余弦相似度
        const scored = this.documents.map((doc) => ({
            ...doc,
            score: this.cosineSimilarity(queryEmbedding, doc.embedding),
        }));

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    /**
     * 获取文档列表
     */
    async getDocuments(page: number, limit: number) {
        const start = (page - 1) * limit;
        const docs = this.documents.slice(start, start + limit);

        return {
            documents: docs,
            total: this.documents.length,
            page,
            limit,
        };
    }

    private buildRagPrompt(
        question: string,
        context: string,
        history: any[],
    ): string {
        const historyStr = history.length > 0 ? `对话历史：${JSON.stringify(history, null, 2)}` : '';
        return `你是一个高等教育质量监测领域的专家。请根据提供的知识数据回答用户问题。

知识数据：
${context}

${historyStr}

用户问题：${question}

请根据知识数据给出准确、专业的回答。如果知识数据中没有相关信息，请如实说明。`;
    }

    private async generateEmbedding(text: string): Promise<number[]> {
        try {
            const response = await this.axiosInstance.post(`${this.aiServiceUrl}/embed`, {
                text,
                model: this.configService.get('EMBEDDING_MODEL_NAME', 'bge-large-zh'),
            });
            return response.data.embedding;
        } catch (error) {
            this.logger.error(`向量生成失败: ${error.message}`);
            return Array(768).fill(0).map(() => Math.random());
        }
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
