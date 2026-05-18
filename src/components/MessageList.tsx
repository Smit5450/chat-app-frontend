import { useEffect, useRef } from "react";

import MessageBubble from "./MessageBubble";
import type { Message } from "../types/message.ts";

interface Props {
  messages: Message[];

  currentUser: any;

  onDelete: (id: string) => void;
}

const MessageList = ({
  messages,

  currentUser,

  onDelete,
}: Props) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div
      className="
        flex-1
        overflow-y-auto
        space-y-2
        mb-4
      "
    >
      {messages.map((message, index) => {
        const isOwnMessage = message.sender === currentUser?.name;

        return (
          <MessageBubble
            key={index}
            message={message}
            isOwnMessage={isOwnMessage}
            onDelete={onDelete}
          />
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
