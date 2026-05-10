import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EarlyWarningController } from './early-warning.controller';
import { EarlyWarningService } from './early-warning.service';
import { WarningRecord, Teacher, Course, Student } from '@/database/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([WarningRecord, Teacher, Course, Student]),
    ],
    controllers: [EarlyWarningController],
    providers: [EarlyWarningService],
    exports: [EarlyWarningService],
})
export class EarlyWarningModule { }
