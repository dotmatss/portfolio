export interface Message {
  role: "user" | "assistant";
  content: string;
}

export type Theme = "dark" | "light";
