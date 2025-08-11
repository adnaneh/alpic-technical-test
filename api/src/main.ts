import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, LogLevel, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { getCorsOrigin } from "./config/cors";
import { LoggingInterceptor } from "./common/logging.interceptor";

async function bootstrap() {
  const parsedOrigin = getCorsOrigin();
  const env = process.env.NODE_ENV ?? "development";
  const isTest = env === "test";
  const prodLogLevels: LogLevel[] = ["error", "warn", "log"];
  const devLogLevels: LogLevel[] = [...prodLogLevels, "debug", "verbose"];
  const loggerLevels = isTest
    ? false
    : env === "production"
    ? prodLogLevels
    : devLogLevels;

  const app = await NestFactory.create(AppModule, {
    cors: { origin: parsedOrigin, credentials: true },
    logger: loggerLevels,
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());

  const logger = new Logger("Bootstrap");
  const swaggerEnabled = env !== "production";
  logger.log(
    `Env=${env} | CORS=${JSON.stringify(parsedOrigin)} | Swagger=${swaggerEnabled}`,
  );

  if (swaggerEnabled) {
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
  logger.log(`Listening on port ${port}`);
}
bootstrap();
