import { Body, Controller, Post, Res, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";

import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  stepCountIs,
  pipeUIMessageStreamToResponse,
  createUIMessageStream,
} from "ai";
import type { UIMessage } from "ai";

import { McpClientService } from "../mcp/mcp-client.service";
import { ChatRequestDto } from "./dto/chat-request.dto";

const SYSTEM_PROMPT = `
You are an AI assistant with audiobook controls.

Workflow:
1) Explain your next action.
2) Call the required tool(s).
3) Narrate the result(s).
4) End with a short summary.

Rules for playback:
- You may only have ONE chapter playing at a time.
- Do not request multiple chapters in the same turn.
- Do not chain multiple play() calls in one response.

Behave like a careful, methodical audiobook operator who follows the above rules strictly.
`;

@ApiTags("Chat")
@Controller()
export class ChatController {
  constructor(
    private readonly cfg: ConfigService,
    private readonly mcpClient: McpClientService,
  ) {}

  @Post("chat")
  @ApiOperation({ summary: "AI chat endpoint (streaming)" })
  @ApiResponse({ status: 200, description: "Server-sent event stream" })
  @ApiResponse({ status: 400, description: "Invalid request format" })
  async chat(@Body() body: ChatRequestDto, @Res() res: Response) {
    if (!body || typeof body.socketId !== "string" || !body.message) {
      throw new BadRequestException("message and socketId are required");
    }
    const apiKey = this.cfg.get<string>("OPENAI_API_KEY");
    const tools = this.mcpClient.listAllToolDefs({ socketId: body.socketId });
    const openai = createOpenAI({ apiKey });
    const modelName = this.cfg.get<string>("OPENAI_MODEL") || "gpt-4o";
    const stepsRaw = this.cfg.get<string>("CHAT_MAX_STEPS");
    const stepsNum = stepsRaw !== undefined ? Number(stepsRaw) : 10;
    const maxSteps = Number.isFinite(stepsNum) && stepsNum > 0 ? Math.floor(stepsNum) : 10;

    const prompt = this.extractTextPrompt(body.message);

    const stream = streamText({
      model: openai.responses(modelName),
      system: SYSTEM_PROMPT,
      prompt,
      tools,
      stopWhen: stepCountIs(maxSteps),
      providerOptions: {
        openai: { store: true, previousResponseId: body.previousResponseId },
      },
    });

    const uiStream = createUIMessageStream({
      async execute({ writer }) {
        writer.merge(stream.toUIMessageStream());
        const metadata = await stream.providerMetadata;
        const responseId = metadata?.openai?.responseId;
        if (responseId) {
          writer.write({ type: "data-response-id", data: { responseId } });
        }
      },
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream: uiStream,
      status: 200,
      statusText: "OK",
    });
  }
  
  private extractTextPrompt(message: UIMessage): string {
    const first = message.parts?.[0];
    if (first && first.type === "text" && typeof first.text === "string") {
      return first.text;
    }
    return "";
  }
}
