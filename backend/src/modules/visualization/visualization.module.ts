import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisualizationController } from './visualization.controller';
import { VisualizationService } from './visualization.service';
import { Teacher, Course, Student, College, WarningRecord } from '@/database/entities';

@Module({
    imports: [TypeOrmModule.forFeature([Teacher, Course, Student, College, WarningRecord])],
    controllers: [VisualizationController],
    providers: [VisualizationService],
    exports: [VisualizationService],
})
export class VisualizationModule { }
