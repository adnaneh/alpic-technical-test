import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import { createOpenAI } from '@ai-sdk/openai';
import {
  streamText,
  stepCountIs,
  pipeUIMessageStreamToResponse,
  createUIMessageStream,
  UIMessage,
} from 'ai';

import { McpClientService } from '../mcp/mcp-client.service';

interface ChatRequestBody {
  message?: UIMessage;
  previousResponseId?: string;
}

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

@ApiTags('Chat')
@Controller()
export class ChatController {
  constructor(
    private readonly cfg: ConfigService,
    private readonly mcpClient: McpClientService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'AI chat endpoint (streaming)' })
  @ApiResponse({ status: 200, description: 'Server-sent event stream' })
  @ApiResponse({ status: 400, description: 'Invalid request format' })
  async chat(@Body() body: ChatRequestBody, @Res() res: Response) {
    const apiKey = this.cfg.get<string>('OPENAI_API_KEY');
    const tools = this.mcpClient.listAllToolDefs();
    console.log('Available tools:', Object.keys(tools));
    const openai = createOpenAI({ apiKey });

    const prompt = body?.message?.parts?.[0]?.type === "text" ? body.message.parts[0].text : "";
    const previousResponseId = body?.previousResponseId;

    const stream = streamText({
      model: openai.responses('gpt-4o'),
      system: SYSTEM_PROMPT,
      prompt,
      tools,
      stopWhen: stepCountIs(10),
      providerOptions: {
        openai: { store: true, previousResponseId },
      },
    });

    const uiStream = createUIMessageStream({
      async execute({ writer }) {
        writer.merge(stream.toUIMessageStream());
        const metadata = await stream.providerMetadata;
        const responseId = metadata?.openai?.responseId;
        if (responseId) {
          writer.write({ type: 'data-response-id', data: { responseId } });
        }
      },
    });

    pipeUIMessageStreamToResponse({
      response: res,
      stream: uiStream,
      status: 200,
      statusText: 'OK',
    });
  }
}
