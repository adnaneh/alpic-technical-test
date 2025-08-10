import React, { useRef } from 'react';
import { render, cleanup } from '@testing-library/react';
import { useSocketAudio } from './useSocketAudio';

// Mock socket.io-client to capture handlers and socket instance
const disconnectMock = vi.fn();
const handlers: Record<string, Function> = {};

vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => ({
      on: (event: string, cb: Function) => { handlers[event] = cb; },
      disconnect: disconnectMock,
    })),
  };
});

function TestSocketAudio({ audio }: { audio: HTMLAudioElement }) {
  const audioRef = useRef<HTMLAudioElement | null>(audio);
  useSocketAudio(audioRef);
  return null;
}

describe('useSocketAudio', () => {
  afterEach(() => {
    cleanup();
    for (const k of Object.keys(handlers)) delete handlers[k];
    disconnectMock.mockReset();
  });

  it('handles play, pause, and resume events', async () => {
    const audio = document.createElement('audio');
    const playMock = vi.fn().mockResolvedValue(undefined);
    const pauseMock = vi.fn();
    audio.play = playMock;
    audio.pause = pauseMock;

    render(<TestSocketAudio audio={audio} />);

    // Simulate play
    handlers['play']?.({ url: 'https://example.com/a.mp3', start_sec: 3 });
    expect(pauseMock).toHaveBeenCalled();
    expect(audio.src).toContain('https://example.com/a.mp3');
    expect(audio.currentTime).toBe(3);
    expect(playMock).toHaveBeenCalled();

    // Simulate pause
    handlers['pause']?.();
    expect(pauseMock).toHaveBeenCalledTimes(2);

    // Simulate resume
    handlers['resume']?.();
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('disconnects socket on unmount', () => {
    const audio = document.createElement('audio');
    const { unmount } = render(<TestSocketAudio audio={audio} />);
    unmount();
    expect(disconnectMock).toHaveBeenCalled();
  });
});
