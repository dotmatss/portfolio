import { create } from "zustand";
import { Message } from "@/types/common";
import { postChatStream } from "@/lib/api";

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

interface ChatStore {
  isOpen: boolean;
  messages: Message[];
  input: string;
  isLoading: boolean;
  isStreaming: boolean;
  sessionId: string;
  toggleChat: () => void;
  setInput: (input: string) => void;
  sendMessage: () => Promise<void>;
}

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi! I'm Jefferson's AI assistant. Ask me anything about his skills, experience, or projects.",
};

export const useChatStore = create<ChatStore>()((set, get) => ({
  isOpen: false,
  messages: [GREETING],
  input: "",
  isLoading: false,
  isStreaming: false,
  sessionId: generateSessionId(),

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  setInput: (input) => set({ input }),

  sendMessage: async () => {
    const { input, messages, isLoading, sessionId } = get();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    set({
      messages: [...messages, userMessage],
      input: "",
      isLoading: true,
      isStreaming: true,
    });

    const streamingMessage: Message = { role: "assistant", content: "" };
    set((state) => ({
      messages: [...state.messages, streamingMessage],
    }));

    let accumulatedContent = "";

    await postChatStream(
      [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      })),
      sessionId,
      (token) => {
        accumulatedContent += token;
        set((state) => {
          const msgs = [...state.messages];
          msgs[msgs.length - 1] = {
            role: "assistant",
            content: accumulatedContent,
          };
          return { messages: msgs };
        });
      },
      (finalContent) => {
        set((state) => {
          const msgs = [...state.messages];
          msgs[msgs.length - 1] = {
            role: "assistant",
            content: finalContent || accumulatedContent,
          };
          return { messages: msgs, isLoading: false, isStreaming: false };
        });
      },
      (error) => {
        set((state) => {
          const msgs = [...state.messages];
          msgs[msgs.length - 1] = {
            role: "assistant",
            content: "Sorry, something went wrong. Please try again.",
          };
          return { messages: msgs, isLoading: false, isStreaming: false };
        });
      }
    );
  },
}));
