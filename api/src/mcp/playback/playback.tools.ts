import { z } from 'zod';

// Tool parameter schemas
export const PlayParams = z.object({
  url: z.string().describe('The URL of the audio file to play'),
  start_sec: z.number().optional().describe('The starting position in seconds (default: 0)')
});

export const PauseParams = z.object({});

export const ResumeParams = z.object({});

export const StatusParams = z.object({});

// Tool definitions for AI SDK
export const PLAYBACK_TOOLS = {
  play: {
    description: 'Start playing an audio file from a specific position',
    parameters: PlayParams,
  },
  pause: {
    description: 'Pause the currently playing audio',
    parameters: PauseParams,
  },
  resume: {
    description: 'Resume playback of the currently paused audio',
    parameters: ResumeParams,
  },
  status: {
    description: 'Get the current playback status and information',
    parameters: StatusParams,
  },
};

export type PlaybackToolName = keyof typeof PLAYBACK_TOOLS;