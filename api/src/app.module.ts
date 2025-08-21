import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ChatModule } from "./chat/chat.module";
import { LibraryMcpModule } from "./mcp/library/library.module";
import { PlaybackMcpModule } from "./mcp/playback/playback.module";
import { validateEnv } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true, validate: validateEnv }),
    ChatModule,
    LibraryMcpModule,
    PlaybackMcpModule,
  ],
})
export class AppModule {}
