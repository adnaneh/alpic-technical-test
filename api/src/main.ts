import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Server } from 'socket.io';
import { PlaybackService } from './mcp/playback/playback.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('API for chat application with MCP tools')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  // Add Socket.IO for playback control
  const httpServer = app.getHttpServer();
  const io = new Server(httpServer, { 
    cors: { origin: '*' },
    path: '/socket.io'
  });
  
  // Initialize playback service with Socket.IO instance
  const playbackService = app.get(PlaybackService);
  playbackService.setIoServer(io);
  
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();