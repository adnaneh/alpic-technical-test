import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ChatModule } from "./chat/chat.module";
import { LibraryServerModule } from "./mcp/library/library-server.module";
import { PlaybackServerModule } from "./mcp/playback/playback-server.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    ChatModule,
    LibraryServerModule,
    PlaybackServerModule,
  ],
})
export class AppModule {}
