import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class RagService {
    private readonly logger = new Logger(RagService.name);
    private readonly aiServiceUrl: string;
    private documents: any[] = [];
    private readonly axiosInstance: any;

    constructor(private configService: ConfigService) {
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

        const relevantDocs = await this.semanticSearch(question, 3);

        const context = relevantDocs
            .map((doc: any) => doc.content)
            .join('\n\n');

        const prompt = this.buildRagPrompt(question, context, conversationHistory);

        try {
            const response = await this.axiosInstance.post(`${this.aiServiceUrl}/chat`, {
                prompt,
                model: this.configService.get('AI_MODEL_NAME', 'chatglm3-6b'),
                temperature: 0.7,
                max_tokens: 2000,
            });

            return {
                answer: response.data.answer,
                sources: relevantDocs.map((doc: any) => ({
                    title: doc.title,
                    relevance: doc.score,
                })),
                timestamp: new Date().toISOString(),
            };
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
