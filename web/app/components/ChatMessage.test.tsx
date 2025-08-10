import { render, screen } from '@testing-library/react';
import React from 'react';
import { ChatMessage } from './ChatMessage';
import type { UIMessage } from '@ai-sdk/react';

describe('ChatMessage', () => {
  it('renders user message text via markdown', () => {
    const userMsg: UIMessage = {
      id: '1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello **world**' }],
    };

    render(<ChatMessage message={userMsg} isLast={false} loading={false} />);
    expect(
      screen.getByText((_, node) => node?.textContent === 'Hello world', { selector: 'p' })
    ).toBeInTheDocument();
  });

  it('renders assistant message text', () => {
    const aiMsg: UIMessage = {
      id: '2',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hi there' }],
    };

    render(<ChatMessage message={aiMsg} isLast={false} loading={false} />);
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  it('shows thinking hint when loading last assistant message without tool output', () => {
    const aiMsg: UIMessage = {
      id: '3',
      role: 'assistant',
      parts: [],
    };

    render(<ChatMessage message={aiMsg} isLast loading />);
    expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();
  });
});
