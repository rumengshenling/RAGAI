import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
    @ApiProperty({ description: '用户问题' })
    @IsString()
    question: string;

    @ApiProperty({ description: '对话历史', required: false })
    @IsOptional()
    conversationHistory?: any[];
}

export class UploadDocumentDto {
    @ApiProperty({ description: '文档标题' })
    @IsString()
    title: string;

    @ApiProperty({ description: '文档内容' })
    @IsString()
    content: string;

    @ApiProperty({ description: '分类', required: false })
    @IsOptional()
    @IsString()
    category?: string;

    @ApiProperty({ description: '标签', required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
