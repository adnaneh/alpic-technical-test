import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

async function bootstrap() {
  const originEnv = process.env.CORS_ORIGIN?.trim();
  const parsedOrigin = (() => {
    if (!originEnv) {
      
      return process.env.NODE_ENV === "production" ? [] : true;
    }
    const parts = originEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length > 1 ? parts : (parts[0] ?? true);
  })();

  const app = await NestFactory.create(AppModule, {
    cors: { origin: parsedOrigin, credentials: true },
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.NODE_ENV !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Chat API")
      .setDescription("API for chat application with MCP tools")
      .setVersion("1.0")
      .build();
    SwaggerModule.setup(
      "api-docs",
      app,
      SwaggerModule.createDocument(app, config),
    );
  }

  const port = Number(process.env.PORT) || 3000;
  
  await app.listen(port, "::");
}
bootstrap();
