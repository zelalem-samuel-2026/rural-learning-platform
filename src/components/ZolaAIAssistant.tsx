import { Component, ErrorInfo, FormEvent, ReactNode, useEffect, useRef, useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

const SYSTEM_PROMPT =
  "You are Zola AI Assistant, a friendly high school tutor. Use the provided lesson context to answer. Answer in Amharic or English.";

interface AssistantErrorBoundaryState {
  hasError: boolean;
}

class AssistantErrorBoundary extends Component<{ children: ReactNode }, AssistantErrorBoundaryState> {
  state: AssistantErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AssistantErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Zola AI Assistant render failed:', error, errorInfo);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function ZolaAIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    setInput('');
    setMessages((current) => [...current, { role: 'user', text: prompt }]);
    setIsLoading(true);

    try {
      // ኤፒአይ ቁልፉ ከ Environment Variable የሚነበብበት መንገድ
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey) {
        throw new Error('Groq API Key is missing in environment variables.');
      }

      const context = document.body.innerText.substring(0, 3000);

      const formattedMessages = [
        {
          role: 'system',
          content: `${SYSTEM_PROMPT}\n\nLesson context from page:\n${context}`,
        },
        ...messages.map((m) => ({
          role: m.role,
          content: m.text,
        })),
        { role: 'user', content: prompt },
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: formattedMessages,
          temperature: 0.6,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API request failed');
      }

      const responseText = data.choices[0]?.message?.content || 'መልስ ማግኘት አልተቻለም።';
      setMessages((current) => [...current, { role: 'assistant', text: responseText }]);
    } catch (error) {
      console.error('Zola AI request failed:', error);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'Zola ግንኙነት መፍጠር አልቻለም። እባክዎን የኢንተርኔት ግንኙነትዎን ወይም የ API Key ውቅር ያረጋግጡ።',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {isOpen ? (
        <section
          aria-label="Zola AI Assistant chat"
          className="flex h-[50vh] min-h-[320px] max-h-[640px] w-[90vw] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        >
          <header className="flex items-center justify-between bg-blue-700 px-4 py-3 text-white">
            <h2 className="font-bold">Zola AI Assistant</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Minimize Zola AI Assistant"
              className="rounded-lg px-2 py-1 text-lg hover:bg-white/15"
            >
              ❌
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3" aria-live="polite">
            {messages.length === 0 && (
              <p className="rounded-xl bg-white p-3 text-sm text-gray-600 shadow-sm">
                ሰላም! ስለዚሁ ትምህርት ወይም ገጽ የምትፈልገውን ማንኛውንም ጥያቄ ጠይቀኝ።
              </p>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] whitespace-pre-wrap rounded-xl p-3 text-sm ${
                  message.role === 'user'
                    ? 'ml-auto bg-blue-700 text-white'
                    : 'bg-white text-gray-800 shadow-sm'
                }`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && <p className="text-sm text-gray-500">Zola በማሰብ ላይ ነው...</p>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 border-t border-gray-200 bg-white p-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
              aria-label="Message Zola"
              placeholder="ጥያቄዎን አስገቡ..."
              className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Zola AI Assistant"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-2xl text-white shadow-xl transition hover:scale-105 hover:bg-blue-800"
        >
          🤖
        </button>
      )}
    </div>
  );
}

export function ZolaAIAssistant() {
  return (
    <AssistantErrorBoundary>
      <ZolaAIAssistantWidget />
    </AssistantErrorBoundary>
  );
}