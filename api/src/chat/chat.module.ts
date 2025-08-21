import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { McpClientModule } from "../mcp/mcp-client.module";

@Module({
  imports: [McpClientModule],
  controllers: [ChatController],
})
export class ChatModule {}
