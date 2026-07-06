import { create } from "zustand";
import { Message } from "@/types/common";
import { postChat } from "@/lib/api";

interface ChatStore {
  isOpen: boolean;
  messages: Message[];
  input: string;
  isLoading: boolean;
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

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),

  setInput: (input) => set({ input }),

  sendMessage: async () => {
    const { input, messages, isLoading } = get();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    set({ messages: [...messages, userMessage], input: "", isLoading: true });

    try {
      const data = await postChat(
        [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }))
      );
      set((state) => ({
        messages: [...state.messages, { role: "assistant", content: data.content }],
      }));
    } catch {
      set((state) => ({
        messages: [
          ...state.messages,
          { role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ],
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
