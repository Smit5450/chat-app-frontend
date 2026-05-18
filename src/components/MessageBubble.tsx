import type { Message } from "../types/message.ts";

interface Props {
  message: Message;

  isOwnMessage: boolean;

  onDelete: (id: string) => void;
}

const MessageBubble = ({
  message,

  isOwnMessage,

  onDelete,
}: Props) => {
  return (
    <div
      className={`
        flex
        ${isOwnMessage ? "justify-end" : "justify-start"}
      `}
    >
      <div
        className={`
          max-w-[70%]
          p-3
          rounded-2xl
          text-white

          ${isOwnMessage ? "bg-blue-500" : "bg-slate-700"}
        `}
      >
        {!isOwnMessage && (
          <p
            className="
              text-sm
              font-bold
              mb-1
            "
          >
            {message.name}
          </p>
        )}

        <p>{message.text}</p>

        <p
          className="
            text-xs
            text-gray-200
            mt-1
            text-right
          "
        >
          {message.time}
        </p>

        {isOwnMessage && (
          <p
            className="
              text-[10px]
              text-right
              text-gray-200
              mt-1
            "
          >
            {message.status === "seen"
              ? "👁"
              : message.status === "delivered"
                ? "✓✓"
                : "✓"}
          </p>
        )}

        {isOwnMessage && (
          <button
            onClick={() => onDelete(message._id)}
            className="
              text-xs
              text-red-300
              mt-1
              hover:text-red-500
            "
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
