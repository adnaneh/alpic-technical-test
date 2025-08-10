import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ToolPart } from './ToolPart';
import type { ToolUIPart } from 'ai';

vi.mock('ai', () => ({
  getToolName: (p: { name?: string }) => (p && p.name) ? p.name : 'unknown',
}));

describe('ToolPart', () => {
  it('renders label and preparing state with input', () => {
    const part: ToolUIPart & { name: string } = {
      type: 'tool-list_books',
      toolCallId: 'call-1',
      state: 'input-streaming',
      input: { q: 'hello' },
      name: 'list_books',
    };

    render(<ToolPart part={part} />);

    expect(
      screen.getAllByText((_, el) => Boolean(el?.textContent?.includes('List Books'))).length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Preparing…')).toBeInTheDocument();
    expect(screen.getByText(/"q": "hello"/)).toBeInTheDocument();
  });

  it('renders output when available', () => {
    const part: ToolUIPart & { name: string } = {
      type: 'tool-get_chapter_audio',
      toolCallId: 'call-2',
      state: 'output-available',
      input: {},
      output: { url: 'u', start_sec: 3 },
      name: 'get_chapter_audio',
    };

    render(<ToolPart part={part} />);
    expect(
      screen.getAllByText((_, el) => Boolean(el?.textContent?.includes('Audio Retrieval'))).length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText(/"start_sec": 3/)).toBeInTheDocument();
  });

  it('renders error state text', () => {
    const part: ToolUIPart & { name: string } = {
      type: 'tool-play',
      toolCallId: 'call-3',
      state: 'output-error',
      input: {},
      errorText: 'boom',
      name: 'play',
    };
    render(<ToolPart part={part} />);
    expect(
      screen.getAllByText((_, el) => Boolean(el?.textContent?.includes('Audio Playback'))).length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
