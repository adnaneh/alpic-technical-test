import { z } from 'zod';

export const PauseParams = z.object({});

export const ResumeParams = z.object({});

export const PlayParams = z.object({
  url: z.string().describe('Audio file URL'),
  start_sec: z.number().optional().describe('Start position in seconds (default: 0)')
});

export const EmptyParams = z.object({});
