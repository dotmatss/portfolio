"use client";

import { useRef, useEffect } from "react";
import { useChatStore } from "@/store/chat.store";

export default function ChatWidget() {
  const { isOpen, messages, input, isLoading, isStreaming, toggleChat, setInput, sendMessage } =
    useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return (
    <div className="fixed bottom-7 right-7 z-[200] font-sans">
      {isOpen && (
        <div className="absolute bottom-[72px] right-0 w-[380px] max-h-[520px] bg-bg-alt border border-line-strong flex flex-col shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between p-4 px-[18px] border-b border-line">
            <div className="flex items-center gap-3">
              <div className="w-[34px] h-[34px] rounded-full bg-accent text-bg flex items-center justify-center font-mono text-[11px] font-bold tracking-wider">
                AI
              </div>
              <div>
                <div className="text-sm font-semibold">Jefferson&apos;s Assistant</div>
                <div className="text-[11px] text-muted font-mono">Always online</div>
              </div>
            </div>
            <button
              className="bg-transparent border-none text-muted cursor-pointer p-1 hover:text-fg transition-colors"
              onClick={() => useChatStore.setState({ isOpen: false })}
              aria-label="Close chat"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-[18px] flex flex-col gap-3.5 min-h-[280px] max-h-[360px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : ""}`}>
                <div
                  className={`max-w-[80%] py-2.5 px-3.5 text-[13.5px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-fg text-bg"
                      : "bg-card border border-line text-fg"
                  }`}
                >
                  {msg.content}
                  {i === messages.length - 1 && isStreaming && msg.role === "assistant" && (
                    <span className="inline-block w-[2px] h-[14px] bg-fg ml-0.5 animate-[blink_1s_step-end_infinite]" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && !isStreaming && (
              <div className="flex">
                <div className="flex gap-1.5 py-3 px-4 bg-card border border-line">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-[chatdot_1.4s_ease-in-out_infinite]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-[chatdot_1.4s_ease-in-out_infinite_0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted animate-[chatdot_1.4s_ease-in-out_infinite_0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="flex p-3.5 px-[18px] border-t border-line gap-2.5" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 bg-card border border-line text-fg py-2.5 px-3.5 text-[13px] font-sans outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send"
              className="w-10 h-10 bg-fg text-bg border-none cursor-pointer flex items-center justify-center shrink-0 transition-colors hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        className="w-14 h-14 rounded-full bg-fg text-bg border-none cursor-pointer flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:scale-105 hover:bg-accent transition-all duration-300"
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
