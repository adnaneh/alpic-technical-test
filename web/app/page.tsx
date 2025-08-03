"use client";
import ReactMarkdown from "react-markdown";
import { useRef, useEffect, useState } from "react";
import { useChat } from '@ai-sdk/react';
import { io } from "socket.io-client";

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
  state: 'call' | 'result' | 'error';
  startTime?: number;
  endTime?: number;
}

// Helper function to get friendly tool names
const getToolDisplayName = (toolName: string): string => {
  const displayNames: Record<string, string> = {
    'get_catalog': '📚 Catalog Search',
    'list_books': '🔍 Book Search', 
    'list_chapters': '📖 Chapter Listing',
    'get_chapter_audio': '🎧 Audio Retrieval',
    'play': '▶️ Audio Playback',
    'pause': '⏸️ Pause Control',
    'resume': '▶️ Resume Control',
    'status': '📊 Playback Status'
  };
  return displayNames[toolName] || `🔧 ${toolName}`;
};

export default function Home() {
  // Manual input state management (required in AI SDK v5)
  const [input, setInput] = useState('');
  
  const { 
    messages, 
    sendMessage,
    status,
    error
  } = useChat({
    api: 'http://localhost:3001/chat',
  });

  // Handle input changes manually
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle form submission manually
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  // Helper to check if loading
  const isLoading = status === 'submitted' || status === 'streaming';









  const audioRef = useRef<HTMLAudioElement>(null);
  const socketRef = useRef<any>(null);

  // Initialize socket connection once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:3001");
    }
    const socket = socketRef.current;
    
    let playTimeout: NodeJS.Timeout;
    socket.on("play", ({ url, start_sec }: { url: string; start_sec: number }) => {
      // Clear any pending play operations
      clearTimeout(playTimeout);
      
      playTimeout = setTimeout(() => {
        if (audioRef.current) {
          // Stop current playback first
          audioRef.current.pause();
          audioRef.current.src = url;
          audioRef.current.currentTime = start_sec || 0;
          // Small delay to ensure audio element is ready
          setTimeout(() => {
            audioRef.current?.play().catch(console.error);
          }, 100);
        }
      }, 200); // Debounce for 200ms
    });

    socket.on("pause", () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    });

    socket.on("resume", () => {
      if (audioRef.current) {
        audioRef.current.play().catch(console.error);
      }
    });

    // Tool call handler moved to separate effect

    // Add audio event listeners to sync state back to server
    const audio = audioRef.current;
    if (audio) {
      const handlePlay = () => {
        socket.emit("audio-state-update", { status: "playing" });
      };
      
      const handlePause = () => {
        socket.emit("audio-state-update", { status: "paused" });
      };
      
      const handleEnded = () => {
        socket.emit("audio-state-update", { status: "idle" });
      };

      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        socket.disconnect();
      };
    }

    // Cleanup function
    return () => {
      clearTimeout(playTimeout);
      if (socket && socket === socketRef.current) {
        socket.off("play");
        socket.off("pause");
        socket.off("resume");
      }
    };
  }, []); // Empty dependency array - only run once


  return (
    <main className="flex flex-col h-screen p-4">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* Initial greeting */}
        <div className="text-left">
          <ReactMarkdown>Hello 👋 What can I do for you?</ReactMarkdown>
        </div>
        
        {/* Show all messages */}
        {messages.map((message, index) => (
          <div key={message.id} className="space-y-2">
            {message.role === 'user' ? (
              /* User message */
              <div className="text-right">
                <ReactMarkdown>
                  {message.parts.map((part) => 
                    part.type === 'text' ? part.text : ''
                  ).join('')}
                </ReactMarkdown>
              </div>
            ) : (
              /* AI response */
              <div className="text-left space-y-2">
                {/* Show thinking indicator when loading and this is the last message */}
                {isLoading && index === messages.length - 1 && message.parts.length === 0 && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="animate-pulse">🤖</span>
                    <span className="italic">AI is thinking...</span>
                  </div>
                )}
                
                {/* Enhanced tool execution display */}
                {message.parts.some((part: any) => part.type === 'tool-call') && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <div className="font-semibold mb-3 flex items-center gap-2 text-blue-700">
                      <span>🔧</span>
                      <span>Tool Execution</span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded-full">
                        {message.parts.filter((part: any) => part.type === 'tool-call').length} tool{message.parts.filter((part: any) => part.type === 'tool-call').length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {message.parts.filter((part: any) => part.type === 'tool-call').map((tool: any) => (
                        <div key={tool.toolCallId} className="bg-white rounded-lg p-3 border border-gray-200">
                          {/* Tool header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span>🔧</span>
                              <span className="font-medium text-gray-700">
                                {getToolDisplayName(tool.toolName)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Tool parameters */}
                          {tool.args && Object.keys(tool.args).length > 0 && (
                            <div className="mb-2">
                              <div className="text-xs font-medium text-gray-600 mb-1">Parameters:</div>
                              <div className="text-xs bg-gray-50 rounded p-2 font-mono">
                                {JSON.stringify(tool.args, null, 2)}
                              </div>
                            </div>
                          )}
                          
                          {/* Tool result - look for corresponding tool-result part */}
                          {(() => {
                            const resultPart = message.parts.find((p: any) => 
                              p.type === 'tool-result' && p.toolCallId === tool.toolCallId
                            ) as any;
                            return resultPart?.result ? (
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-1">Result:</div>
                                <div className="text-xs bg-green-50 rounded p-2 font-mono max-h-32 overflow-y-auto">
                                  {typeof resultPart.result === 'string' ? resultPart.result : JSON.stringify(resultPart.result, null, 2)}
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Show AI response */}
                {message.parts.some((part: any) => part.type === 'text') && (
                  <div className="text-left">
                    <ReactMarkdown>
                      {message.parts
                        .filter((part: any) => part.type === 'text')
                        .map((part: any) => part.text)
                        .join('')}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {error && <p className="text-red-500">Error: {error.message}</p>}
      </div>

      {/* Embedded Audio Player */}
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <audio 
          ref={audioRef}
          controls 
          className="w-full"
          preload="none"
        />
        <p className="text-sm text-gray-600 mt-2">
          🎵 Audio player - controlled by chat commands
        </p>
      </div>

      <form 
        onSubmit={handleSubmit}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything"
          className="flex-1 border p-2 rounded"
          disabled={status !== 'ready'}
        />
        <button 
          type="submit"
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={status !== 'ready'}
        >
          Send
        </button>
      </form>
    </main>
  );
}