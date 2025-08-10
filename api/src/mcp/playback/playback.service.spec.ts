import { PlaybackService } from "./playback.service";
import { PlaybackGateway } from "./playback.gateway";
import { Test } from "@nestjs/testing";

describe("PlaybackService", () => {
  let gateway: PlaybackGateway;
  let service: PlaybackService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PlaybackService, PlaybackGateway],
    }).compile();

    gateway = moduleRef.get(PlaybackGateway);
    service = moduleRef.get(PlaybackService);

    jest.spyOn(gateway, "emitPlay").mockImplementation(() => undefined);
    jest.spyOn(gateway, "emitPause").mockImplementation(() => undefined);
    jest.spyOn(gateway, "emitResume").mockImplementation(() => undefined);
  });

  it("play trims url, defaults start_sec to 0, and calls gateway", async () => {
    await service.play({ url: "  https://audio  " });
    expect(gateway.emitPlay).toHaveBeenCalledWith(
      "https://audio",
      0,
      undefined,
    );
  });

  it("play accepts explicit start_sec", async () => {
    await service.play({ url: "https://audio", start_sec: 12 });
    expect(gateway.emitPlay).toHaveBeenCalledWith(
      "https://audio",
      12,
      undefined,
    );
  });

  it("play targets a specific socket when provided in context", async () => {
    await service.play({ url: "https://audio" }, { socketId: "abc123" });
    expect(gateway.emitPlay).toHaveBeenCalledWith("https://audio", 0, "abc123");
  });

  it("play throws when url is empty", async () => {
    await expect(service.play({ url: "   " })).rejects.toThrow(
      "url is required",
    );
    await expect(service.play({})).rejects.toThrow("url is required");
  });

  it("pause emits pause", async () => {
    await service.pause();
    expect(gateway.emitPause).toHaveBeenCalled();
  });

  it("resume emits resume", async () => {
    await service.resume();
    expect(gateway.emitResume).toHaveBeenCalled();
  });
});
