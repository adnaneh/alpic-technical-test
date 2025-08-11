import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerId = (req.headers["x-request-id"] || "").toString().trim();
    const id = headerId || randomUUID();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
  }
}
