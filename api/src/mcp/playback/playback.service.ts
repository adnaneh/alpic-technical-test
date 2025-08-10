import { Injectable } from "@nestjs/common";
import { Tool } from "@rekog/mcp-nest";
import { PlaybackGateway } from "./playback.gateway";
import { PlayParams, PauseParams, ResumeParams } from "./playback.schemas";
import type { ToolCallContext } from "../mcp-context";

@Injectable()
export class PlaybackService {
  constructor(private readonly gateway: PlaybackGateway) {}

  @Tool({
    name: "play",
    description: "Start playing an audio file from a specific position",
    parameters: PlayParams,
  })
  async play(
    { url = "", start_sec = 0 }: { url?: string; start_sec?: number },
    ctx?: ToolCallContext,
  ) {
    const safeUrl = String(url).trim();
    if (!safeUrl) throw new Error("url is required");

    const start = Number.isFinite(+start_sec) ? Number(start_sec) : 0;

    this.gateway.emitPlay(safeUrl, start, ctx?.socketId);
    return {};
  }

  @Tool({
    name: "pause",
    description: "Pause the currently playing audio",
    parameters: PauseParams,
  })
  async pause(_args?: unknown, ctx?: ToolCallContext) {
    this.gateway.emitPause(ctx?.socketId);
    return {};
  }

  @Tool({
    name: "resume",
    description: "Resume playback of the currently paused audio",
    parameters: ResumeParams,
  })
  async resume(_args?: unknown, ctx?: ToolCallContext) {
    this.gateway.emitResume(ctx?.socketId);
    return {};
  }
}
