import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// ģ�鵼��
import { DataCollectionModule } from './modules/data-collection/data-collection.module';
import { EarlyWarningModule } from './modules/early-warning/early-warning.module';
import { RagServiceModule } from './modules/rag-service/rag-service.module';
import { AuthModule } from './modules/auth/auth.module';
import { VisualizationModule } from './modules/visualization/visualization.module';

// ����
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
    imports: [
        // ����ģ��
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local'],
        }),

        // ���ݿ�����
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DB_HOST'),
                port: configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
                logging: ['error', 'warn'],
                autoLoadEntities: true,
            }),
            inject: [ConfigService],
        }),

        // JWT����
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
                },
            }),
            inject: [ConfigService],
        }),

        PassportModule.register({ defaultStrategy: 'jwt' }),

        // ҵ��ģ��
        AuthModule,
        DataCollectionModule,
        EarlyWarningModule,
        RagServiceModule,
        VisualizationModule,
    ],
    providers: [
        // ȫ��JWT����
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule { }
