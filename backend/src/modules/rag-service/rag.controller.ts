import {
    Controller,
    Post,
    Get,
    Body,
    Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RagService } from './rag.service';
import { ChatDto, UploadDocumentDto } from './dto/rag.dto';

@ApiTags('智能问答')
@ApiBearerAuth()
@Controller('rag')
export class RagController {
    constructor(private readonly ragService: RagService) { }

    @Post('chat')
    @ApiOperation({ summary: '智能问答' })
    async chat(@Body() dto: ChatDto) {
        return this.ragService.chat(dto);
    }

    @Post('documents/upload')
    @ApiOperation({ summary: '上传知识库文档' })
    async uploadDocument(@Body() dto: UploadDocumentDto) {
        return this.ragService.uploadDocument(dto);
    }

    @Get('documents')
    @ApiOperation({ summary: '获取知识库文档列表' })
    async getDocuments(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20,
    ) {
        return this.ragService.getDocuments(page, limit);
    }

    @Post('search')
    @ApiOperation({ summary: '语义检索' })
    async semanticSearch(@Body() dto: { query: string; topK?: number }) {
        return this.ragService.semanticSearch(dto.query, dto.topK || 5);
    }
}
