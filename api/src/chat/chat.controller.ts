import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { streamText, stepCountIs, pipeUIMessageStreamToResponse } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { LibraryService } from '../mcp/library/library.service';
import { PlaybackService } from '../mcp/playback/playback.service';
import { buildMcpTools } from '../mcp/tools.builder';

class ChatMessage {
  role: string;
  content?: string;
  parts?: Array<{
    type: string;
    text?: string;
  }>;
}

class ChatRequest {
  prompt?: string;
  messages?: ChatMessage[];
  previousResponseId?: string;
}

@ApiTags('Chat')
@Controller()
export class ChatController {
  constructor(
    private configService: ConfigService,
    private playbackService: PlaybackService,
    private libraryService: LibraryService
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a chat message with AI responses and tool capabilities' })
  @ApiBody({ type: ChatRequest })
  @ApiResponse({ status: 200, description: 'Streaming response with AI chat completion' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async chat(@Body() body: ChatRequest, @Res() res: Response) {
    try {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
      
      // Check if API key is available
      if (!apiKey || apiKey.length < 10) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const mockResponse = "🤖 No valid OpenAI API key found. Please add your API key to the .env file to enable real AI responses with audio control tools.";
        
        // Simulate streaming
        for (const char of mockResponse) {
          res.write(char);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        
        res.end();
        return;
      }

      // Build tools dynamically from MCP services
      const emitToolCall = (name: string, description: string) => {
        const io = (this.playbackService as any).io;
        if (io) {
          io.emit('tool-call', { name, description });
        }
      };
      
      const tools = buildMcpTools(
        this.libraryService,
        this.playbackService,
        emitToolCall
      );

      // Handle both useCompletion (prompt) and useChat (messages) formats
      // AI SDK sends messages with 'parts' array structure
      let userPrompt = body.prompt || '';
      
      if (!userPrompt && body.messages && body.messages.length > 0) {
        const lastMessage = body.messages[body.messages.length - 1];
        
        // Handle AI SDK format (with parts array)
        if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
          const textPart = lastMessage.parts.find(part => part.type === 'text');
          userPrompt = textPart?.text || '';
        } 
        // Handle standard format (with content string)
        else if (lastMessage.content) {
          userPrompt = lastMessage.content;
        }
      }
      
      console.log('📥 Received request:', {
        prompt: userPrompt,
        hasMessages: !!body.messages,
        messageCount: body.messages?.length || 0,
        hasPreviousResponseId: !!body.previousResponseId,
        previousResponseId: body.previousResponseId
      });

      // Define agent system prompt
      const systemPrompt = `You are an AI assistant with audio playbook capabilities and access to a library catalogue. 

MANDATORY BEHAVIOR - YOU MUST FOLLOW THIS EXACTLY:

When a user requests something, you MUST:
1. First, send a text message explaining what you're about to do
2. Then call the necessary tools
3. After each tool call, send another text message explaining what happened
4. Finally, send a summary text message

NEVER call tools without first explaining what you're doing in text.
NEVER stay silent - always narrate your actions.

Example for "play a chapter about RAG":
- Text: "I'll search for chapters about RAG in our audiobook library..."
- Tool: get_catalog()
- Text: "I found a chapter called '6.1 RAG' in the AI Engineering book. Let me get the audio URL..."
- Tool: get_chapter_audio(book_id: 3, chap_id: 32)
- Text: "Got the audio URL! Now starting playback..."
- Tool: play(url: "...", start_sec: 39761)
- Text: "✅ Now playing chapter '6.1 RAG' from AI Engineering. The audio should be starting in your player."

You have access to the following tools:

1. **play** - Start playing audio from a URL (supports .mp3, .wav, .ogg, streams)
   - Parameters: url (required), start_sec (optional, default 0)

2. **pause** - Pause current audio playback
   - No parameters required

3. **resume** - Resume current audio playback  
   - No parameters required

4. **status** - Get current playback status
   - No parameters required

5. **get_catalog** - Get the complete audiobook catalog with all books and chapters
   - No parameters required

6. **list_books** - Search for books by query
   - Parameters: query (required)

7. **list_chapters** - Get chapters for a specific book
   - Parameters: book_id (required)

8. **get_chapter_audio** - Get audio URL and timing for a chapter
   - Parameters: book_id (required), chap_id (required)

**CRITICAL MULTI-STEP WORKFLOW**: When a user says "Play me a chapter about {TOPIC}", you MUST execute ALL these tools in sequence in ONE response:

1. get_catalog() - Get all books and chapters (returns S3 URLs that CANNOT be played directly)
2. Search for relevant chapters about the topic in the catalog
3. get_chapter_audio(book_id, chap_id) - REQUIRED to convert S3 URL to playable HTTPS URL
4. play(url, start_sec) - Use the HTTPS URL from step 3, NOT the S3 URL from catalog

⚠️ IMPORTANT: The catalog contains S3:// URLs which CANNOT be played directly. You MUST call get_chapter_audio() to get a signed HTTPS URL before calling play().

Always execute ALL these steps in sequence. Never try to play S3:// URLs directly.`;

      // System prompt fetching (for MCP integration if needed)
      const systemPrompt2 = await fetch('http://localhost:3001/mcp/system-prompt', {
        method: 'GET'
      }).then(res => res.text()).catch(() => systemPrompt);

      console.log('Using system prompt:', {
        hasSystemPrompt: !!systemPrompt,
        hasPreviousResponseId: !!body.previousResponseId
      });
      
      const openaiClient = createOpenAI({
        apiKey,
        // Add fetch wrapper to log requests
        fetch: async (url, options) => {
          const body = options?.body ? JSON.parse(options.body as string) : null;
          console.log('🔍 OpenAI API Request:', {
            url: url.toString(),
            method: options?.method || 'GET',
            endpoint: url.toString().includes('/v1/responses') ? 'RESPONSES API' : 'OTHER API',
            hasTools: body?.tools ? 'YES' : 'NO',
            toolCount: body?.tools?.length || 0,
            hasStore: body?.store ? 'YES' : 'NO',
            hasPreviousResponseId: body?.previous_response_id ? 'YES' : 'NO'
          });
          
          const response = await fetch(url, options);
          
          console.log('📥 OpenAI API Response:', {
            status: response.status,
            sessionId: response.headers.get('x-session-id'),
            requestId: response.headers.get('x-request-id'),
            contentType: response.headers.get('content-type')
          });
          
          return response;
        }
      });
      
      console.log('Calling OpenAI with tools:', Object.keys(tools));
      
      const result = await streamText({
        model: openaiClient.responses('gpt-4o'), // Use Responses API for conversation continuity
        prompt: userPrompt, // Extract prompt from either format
        system: systemPrompt, // System prompt from MCP server
        tools: tools as any,
        stopWhen: stepCountIs(5), // Allow up to 5 steps for complex operations
        providerOptions: {
          openai: {
            store: true, // Persist conversation history
            previousResponseId: body.previousResponseId, // Continue existing conversation
            metadata: { 
              app: 'alpic-audiobook-player',
              timestamp: new Date().toISOString()
            }
          }
        },
        // Add custom streaming data for better UX
        onChunk: async ({ chunk }) => {
          // Log tool calls for debugging
          if (chunk.type === 'tool-call') {
            console.log('Tool call:', chunk.toolName);
          }
        },
        onStepFinish: ({ toolCalls, toolResults }) => {
          console.log('Step finished:', {
            toolCalls: toolCalls?.map(tc => tc.toolName) || [],
            toolResults: toolResults?.length || 0
          });
        }
      });
      
      console.log('StreamText result created, starting to pipe response...');

      try {
        console.log('About to start streaming...');
        
        // Use UI message stream to surface tool calls and results in the UI
        pipeUIMessageStreamToResponse({
          response: res,
          stream: result.toUIMessageStream(),
          status: 200,
          statusText: 'OK',
          headers: {}
        });
      } catch (streamError: any) {
        console.error('Streaming error:', streamError);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Streaming failed', details: streamError.message });
        }
      }

      // Log response ID for debugging (available after streaming completes)
      result.providerMetadata.then(metadata => {
        const responseId = metadata?.openai?.responseId;
        if (responseId && typeof responseId === 'string') {
          console.log('Response ID for next request:', responseId);
          // TODO: Find a way to pass this to frontend for conversation continuity
        }
      });
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Handle OpenAI errors gracefully with mock response
      if (error.status === 429 || error.status === 401) {
        const mockResponse = "🤖 OpenAI API quota exceeded or invalid key. The audiobook player is working, but AI responses are temporarily unavailable. You can still use the playback controls manually.";
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for (const char of mockResponse) {
          res.write(char);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        res.end();
        return;
      }

      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  }
}