import type { User } from "./user.ts";
import type { Message } from "./message.ts";

export interface Conversation extends User {
  lastMessage: Message;
}
