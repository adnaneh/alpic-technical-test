import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ChatModule } from "./chat/chat.module";
import { LibraryServerModule } from "./mcp/library/library-server.module";
import { PlaybackServerModule } from "./mcp/playback/playback-server.module";
import { validateEnv } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true, validate: validateEnv }),
    ChatModule,
    LibraryServerModule,
    PlaybackServerModule,
  ],
})
export class AppModule {}
