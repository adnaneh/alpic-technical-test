import { Body, Controller, Logger, Post, Req, Res } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";

import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  stepCountIs,
  pipeUIMessageStreamToResponse,
  createUIMessageStream,
} from "ai";


import { McpClientService } from "../mcp/mcp-client.service";
import { ChatRequestDto } from "./chat.dto";
import {
  CFG_CHAT_MAX_STEPS,
  CFG_OPENAI_API_KEY,
  CFG_OPENAI_MODEL,
  CFG_OPENAI_STORE,
} from "../config/keys";

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
    private readonly mcpClient: McpClientService
  ) {}
  private readonly logger = new Logger(ChatController.name);

  @Post("chat")
  @ApiOperation({ summary: "AI chat endpoint (streaming)" })
  @ApiResponse({ status: 200, description: "Server-sent event stream" })
  @ApiResponse({ status: 400, description: "Invalid request format" })
  async chat(@Body() body: ChatRequestDto, @Req() req: Request, @Res() res: Response) {
    const openai = createOpenAI({
      apiKey: this.cfg.get<string>(CFG_OPENAI_API_KEY),
    });
    const modelName = this.cfg.get<string>(CFG_OPENAI_MODEL) ?? "gpt-4o";
    const model = openai.responses(modelName);
    const maxSteps = Number(this.cfg.get(CFG_CHAT_MAX_STEPS)) || 10;
    const tools = this.mcpClient.listAllToolDefs({ socketId: body.socketId });

    const prompt = body.message.parts[0].text;

    this.logger.log(
      `${req.id ? `[${req.id}] ` : ""}chat start model=${modelName} maxSteps=${maxSteps} socketId=${body.socketId ?? "-"}`,
    );

    const stream = streamText({
      model,
      system: SYSTEM_PROMPT,
      prompt,
      tools,
      stopWhen: stepCountIs(maxSteps),
      providerOptions: {
        openai: {
          store: (() => {
            const v = this.cfg.get<string>(CFG_OPENAI_STORE);
            if (v == null) return true;
            return ["1", "true", "yes", "on"].includes(v.toLowerCase());
          })(),
          previousResponseId: body.previousResponseId,
        },
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
}
