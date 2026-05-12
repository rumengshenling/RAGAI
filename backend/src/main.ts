import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { Request, Response } from 'express';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // 安全中间件 - 简化版，不使用 helmet
    app.use((req: Request, res: Response, next: Function) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });

    // CORS配置
    app.enableCors({
        origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5000'],
        credentials: true,
    });

    // 全局验证管道
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: false,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // 全局响应拦截器
    app.useGlobalInterceptors(new TransformInterceptor());

    // 全局异常过滤器
    app.useGlobalFilters(new HttpExceptionFilter());

    // API前缀
    app.setGlobalPrefix('api');

    // Swagger文档配置
    const config = new DocumentBuilder()
        .setTitle('高等教育质量监测AI系统')
        .setDescription('API文档 - 数据采集、可视化驾驶舱、预警分析、智能问答')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('数据采集', '课程、师资、生源数据管理')
        .addTag('可视化驾驶舱', '教学指标可视化展示')
        .addTag('预警分析', '异常监测与归因分析')
        .addTag('智能问答', 'RAG知识库问答')
        .addTag('权限管理', '用户认证与授权')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.APP_PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 应用启动成功: http://localhost:${port}`);
    logger.log(`📚 API文档地址: http://localhost:${port}/api/docs`);
}
bootstrap();