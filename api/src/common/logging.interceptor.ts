import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import type { Request, Response } from "express";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const start = Date.now();

    const method = (req.method || "").toUpperCase();
    const url = req.originalUrl || req.url || "";
    const reqId = req.id as string | undefined;

    this.logger.debug(
      `${reqId ? `[${reqId}] ` : ""}${method} ${url} → start`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const status = res.statusCode;
          this.logger.log(
            `${reqId ? `[${reqId}] ` : ""}${method} ${url} ← ${status} (${ms}ms)`,
          );
        },
        error: (err) => {
          const ms = Date.now() - start;
          const status = res.statusCode || 500;
          this.logger.error(
            `${reqId ? `[${reqId}] ` : ""}${method} ${url} ← ${status} (${ms}ms)`,
            err?.stack || String(err),
          );
        },
      }),
    );
  }
}

