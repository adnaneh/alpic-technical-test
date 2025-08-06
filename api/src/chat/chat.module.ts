import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { McpModule } from '../mcp/mcp.module';

@Module({
  imports: [McpModule],
  controllers: [ChatController],
})
export class ChatModule {}