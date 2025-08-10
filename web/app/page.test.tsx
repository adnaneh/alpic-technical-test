import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

const sendMessage = vi.fn();
let mockStatus: 'idle' | 'submitted' | 'streaming' | 'error' = 'idle';
let mockMessages: unknown[] = [];
let mockError: unknown = null;

vi.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: mockMessages,
    sendMessage,
    status: mockStatus,
    error: mockError,
  }),
}));

vi.mock('ai', () => ({
  DefaultChatTransport: class {},
}));

vi.mock('./hooks/useSocketAudio', () => ({
  useSocketAudio: () => 'sock-1',
}));

import Home from './page';

describe('Home page', () => {
  beforeEach(() => {
    mockStatus = 'idle';
    mockMessages = [];
    mockError = null;
    sendMessage.mockReset();
  });

  it('quick-starter button sends the expected message', () => {
    render(<Home />);
    const btn = screen.getByRole('button', { name: /Play a chapter about RAG/i });
    fireEvent.click(btn);
    expect(sendMessage).toHaveBeenCalledWith({
      role: 'user',
      parts: [{ type: 'text', text: 'Play a chapter about RAG' }],
    });
  });

  it('form submit sends message and clears input; controls disabled while loading', () => {
    render(<Home />);
    const input = screen.getByPlaceholderText('Ask anything');
    const button = screen.getByRole('button', { name: 'Send' });

    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.submit(button.closest('form')!);

    expect(sendMessage).toHaveBeenCalledWith({
      role: 'user',
      parts: [{ type: 'text', text: 'Hello world' }],
    });
    expect(input).toHaveValue('');

    mockStatus = 'streaming';
    cleanup();
    render(<Home />);
    const input2 = screen.getByPlaceholderText('Ask anything');
    const button2 = screen.getByRole('button', { name: 'Send' });
    expect(input2).toBeDisabled();
    expect(button2).toBeDisabled();
  });
});
