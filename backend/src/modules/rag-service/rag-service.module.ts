import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { Student, Teacher, Course, StudentScore, WarningRecord } from '@/database/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([Student, Teacher, Course, StudentScore, WarningRecord]),
    ],
    controllers: [RagController],
    providers: [RagService],
    exports: [RagService],
})
export class RagServiceModule { }
