import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import request from "supertest";

import { ChatController } from "../src/chat/chat.controller";
import { ConfigService } from "@nestjs/config";
import { McpClientService } from "../src/mcp/mcp-client.service";

import {
  UIMessage,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  stepCountIs,
  streamText,
} from "ai";
import { createOpenAI } from "@ai-sdk/openai";

jest.mock("@ai-sdk/openai", () => ({
  createOpenAI: jest.fn(() => ({ responses: jest.fn(() => "mock-model") })),
}));

jest.mock("ai", () => {
  const streamText = jest.fn(() => ({
    toUIMessageStream: jest.fn(() => "ui-stream"),
    providerMetadata: Promise.resolve({ openai: { responseId: "resp-1" } }),
  }));
  const stepCountIs = jest.fn(() => "stopWhen");
  const createUIMessageStream = jest.fn(() => "ui-message-stream");
  type MockResponse = {
    status: (code: number) => MockResponse;
    set: (key: string, value: string) => MockResponse;
    send: (body: string) => void;
  };
  const pipeUIMessageStreamToResponse = jest.fn(
    ({
      response,
      status = 200,
      statusText = "OK",
    }: {
      response: MockResponse;
      status?: number;
      statusText?: string;
    }) => {
      if (statusText) {
        response.set("X-Status-Text", statusText);
      }
      response
        .status(status)
        .set("Content-Type", "text/event-stream")
        .send("data: ok\n\n");
    },
  );
  return {
    streamText,
    stepCountIs,
    createUIMessageStream,
    pipeUIMessageStreamToResponse,
  };
});

const maybeDescribe = process.env.RUN_E2E === "1" ? describe : describe.skip;

describe("ChatController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
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
          useValue: { listAllToolDefs: () => ({ toolA: {} }) },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /chat returns SSE and wires stream", async () => {
    const message: UIMessage = {
      id: "m-1",
      role: "user",
      parts: [{ type: "text", text: "Hello e2e" }],
    };

    await request(app.getHttpAdapter().getInstance())
      .post("/chat")
      .send({ socketId: "s-1", message, previousResponseId: "prev-999" })
      .expect(200)
      .expect("Content-Type", /text\/event-stream/);

    expect(createOpenAI).toHaveBeenCalledWith({ apiKey: "test-api-key" });
    expect(stepCountIs).toHaveBeenCalledWith(10);
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "mock-model",
        prompt: "Hello e2e",
        tools: { toolA: {} },
        stopWhen: "stopWhen",
        providerOptions: {
          openai: { store: true, previousResponseId: "prev-999" },
        },
      }),
    );
    expect(createUIMessageStream).toHaveBeenCalledTimes(1);
    expect(pipeUIMessageStreamToResponse).toHaveBeenCalled();
  });

  it("POST /chat rejects non-text message with 400", async () => {
    const message: UIMessage = {
      id: "m-2",
      role: "user",
      parts: [{ type: "file", mediaType: "image/png", url: "u" }],
    };

    await request(app.getHttpAdapter().getInstance())
      .post("/chat")
      .send({ message })
      .expect(400);
  });
});
