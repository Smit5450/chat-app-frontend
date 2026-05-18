interface Props {
  input: string;

  setInput: (value: string) => void;

  sendMessage: () => void;

  onTyping: (value: string) => void;
}

const ChatInput = ({
  input,

  setInput,

  sendMessage,

  onTyping,
}: Props) => {
  return (
    <div>
      <div
        className="
          flex
          gap-2
        "
      >
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);

            onTyping(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="
            Type message
          "
          className="
            flex-1
            px-4
            py-3
            rounded-xl
            bg-slate-700
            text-white
            outline-none
          "
        />

        <button
          onClick={sendMessage}
          className="
            bg-blue-500
            px-6
            rounded-xl
            text-white
          "
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
