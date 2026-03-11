import { useState, useRef, useEffect } from 'react';
import type { Message } from '~/types/chat';
import MessageBubble from './MessageBubble';

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    "👋 Hi! I'm your internal development Q&A assistant. Ask me anything about our processes, tools, and infrastructure — or ask who to contact for a specific topic.",
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(e?: React.SyntheticEvent) {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    // Don't include the welcome message in the API call history
    const history = messages.filter((m) => m !== WELCOME_MESSAGE);
    const newHistory = [...history, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: { role: 'assistant'; content: string } | { error: string } = await response.json();

      if ('error' in data) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  }

  function handleNewConversation() {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 bg-gray-900/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <span className="text-sm">🔧</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Dev Q&amp;A Assistant</h1>
            <p className="text-xs text-gray-400">Internal knowledge base</p>
          </div>
        </div>
        <button
          id="new-conversation-btn"
          onClick={handleNewConversation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600 transition-all duration-150 cursor-pointer"
        >
          <span>✦{' '}</span>
          <span>New conversation</span>
        </button>
      </header>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-1 scroll-smooth"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent' }}
      >
        {messages.map((message, idx) => (
          <MessageBubble key={`${message.role}-${idx}-${message.content.slice(0, 20)}`} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 mt-1 shadow-lg">
              <span className="text-xs font-bold text-white">AI</span>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-gray-800/80 border border-gray-700/50 shadow-md">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex justify-center mb-4">
            <div className="px-4 py-2 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm max-w-lg text-center">
              ⚠️ {error}
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 py-4 border-t border-gray-800/60 bg-gray-900/60 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about deployments, CI/CD, database, or who to contact..."
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3 pr-12 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
              style={{
                maxHeight: '160px',
                overflow: 'auto',
              }}
            />
          </div>
          <button
            id="send-btn"
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg transition-all duration-150 hover:shadow-indigo-500/25 hover:shadow-xl cursor-pointer"
            aria-label="Send message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
        <p className="text-center text-xs text-gray-600 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
