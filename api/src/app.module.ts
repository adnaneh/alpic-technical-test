import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat/chat.controller';
import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),
    McpModule,
  ],
  controllers: [
    ChatController,
  ],
})
export class AppModule {}