import {
  Controller,
  Post,
  Get,
  Body,
  UseInterceptors,
  UploadedFile,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { DataCollectionService } from './data-collection.service';
import { ImportDataDto, ValidateDataDto } from './dto/data-collection.dto';

@ApiTags('���ݲɼ�')
@ApiBearerAuth()
@Controller('data-collection')
export class DataCollectionController {
  constructor(private readonly dataCollectionService: DataCollectionService) {}

  @Post('upload/teachers')
  @ApiOperation({ summary: '�����ϴ���ʦ����' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTeachers(@UploadedFile() file: Express.Multer.File) {
    return this.dataCollectionService.importTeachers(file);
  }

  @Post('upload/courses')
  @ApiOperation({ summary: '�����ϴ��γ�����' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCourses(@UploadedFile() file: Express.Multer.File) {
    return this.dataCollectionService.importCourses(file);
  }

  @Post('upload/students')
  @ApiOperation({ summary: '�����ϴ�ѧ������' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadStudents(@UploadedFile() file: Express.Multer.File) {
    return this.dataCollectionService.importStudents(file);
  }

  @Post('upload/scores')
  @ApiOperation({ summary: '�����ϴ��ɼ�����' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadScores(@UploadedFile() file: Express.Multer.File) {
    return this.dataCollectionService.importScores(file);
  }

  @Post('validate')
  @ApiOperation({ summary: '��֤���ݸ�ʽ' })
  async validateData(@Body() validateDto: ValidateDataDto) {
    return this.dataCollectionService.validateData(validateDto);
  }

  @Get('import-records')
  @ApiOperation({ summary: '��ȡ�����¼�б�' })
  async getImportRecords(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('dataType') dataType?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    return this.dataCollectionService.getImportRecords(pageNum, limitNum, dataType);
  }

  @Get('import-records/:id')
  @ApiOperation({ summary: '��ȡ�����¼����' })
  async getImportRecordDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.dataCollectionService.getImportRecordDetail(id);
  }

  @Get('template/:type')
  @ApiOperation({ summary: '�������ݵ���ģ��' })
  async downloadTemplate(@Param('type') type: string) {
    return this.dataCollectionService.generateTemplate(type);
  }
}
