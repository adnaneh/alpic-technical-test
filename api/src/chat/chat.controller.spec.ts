import { ChatController } from "./chat.controller";
import { createOpenAI } from "@ai-sdk/openai";
import {
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  stepCountIs,
  streamText,
} from "ai";
import { ConfigService } from "@nestjs/config";
import { response } from "express";
import { McpClientService } from "../mcp/mcp-client.service";
import { Test, TestingModule } from "@nestjs/testing";

jest.mock("@ai-sdk/openai", () => ({
  createOpenAI: jest.fn(() => ({ responses: jest.fn(() => "mock-model") })),
}));
jest.mock("ai", () => {
  const streamText = jest.fn(() => ({
    toUIMessageStream: jest.fn(() => "ui-stream"),
    providerMetadata: Promise.resolve({ openai: { responseId: "resp-1" } }),
  }));
  return {
    streamText,
    stepCountIs: jest.fn(() => "stopWhen"),
    createUIMessageStream: jest.fn(() => "ui-message-stream"),
    pipeUIMessageStreamToResponse: jest.fn(),
  };
});

describe("ChatController", () => {
  let controller: ChatController;
  let moduleRef: TestingModule;
  let mcpClient: { listAllToolDefs: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    moduleRef = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: (k: string) =>
              k === "OPENAI_API_KEY" ? "test-api-key" : undefined,
          },
        },
        {
          provide: McpClientService,
          useValue: { listAllToolDefs: jest.fn(() => ({ toolA: {} })) },
        },
      ],
    }).compile();

    controller = moduleRef.get(ChatController);
    mcpClient = moduleRef.get(McpClientService);
  });

  it("streams with extracted prompt, tools, and previousResponseId", async () => {
    const message: UIMessageDto = {
      id: "1",
      role: "user",
      parts: [{ type: "text", text: "Hello world" }],
    };
    await controller.chat(
      { message, previousResponseId: "prev-123", socketId: "sock-1" },
      response,
    );

    expect(createOpenAI).toHaveBeenCalledWith({ apiKey: "test-api-key" });
    expect(stepCountIs).toHaveBeenCalledWith(10);
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
        prompt: "Hello world",
        tools: { toolA: {} },
        stopWhen: "stopWhen",
        providerOptions: {
          openai: { store: true, previousResponseId: "prev-123" },
        },
      }),
    );
    expect(createUIMessageStream).toHaveBeenCalledTimes(1);
    expect(pipeUIMessageStreamToResponse).toHaveBeenCalledWith(
      expect.objectContaining({ status: 200, statusText: "OK" }),
    );
    expect(mcpClient.listAllToolDefs).toHaveBeenCalled();
  });

  it("forwards socketId to tool registry", async () => {
    const message: UIMessageDto = {
      id: "2",
      role: "user",
      parts: [{ type: "text", text: "Play something" }],
    };
    await controller.chat({ message, socketId: "sock-123" }, response);
    expect(mcpClient.listAllToolDefs).toHaveBeenCalled();
  });
});
import { UIMessageDto } from "./chat.dto";
