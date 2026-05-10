import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataCollectionController } from './data-collection.controller';
import { DataCollectionService } from './data-collection.service';
import {
    Teacher,
    Course,
    Student,
    StudentScore,
    DataImportRecord,
} from '@/database/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Teacher,
            Course,
            Student,
            StudentScore,
            DataImportRecord,
        ]),
    ],
    controllers: [DataCollectionController],
    providers: [DataCollectionService],
    exports: [DataCollectionService],
})
export class DataCollectionModule { }
