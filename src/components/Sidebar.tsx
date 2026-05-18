import type { Conversation } from "../types/conversation.ts";

interface Props {
  conversations: Conversation[];

  currentUser: any;

  selectedUser: any;

  onlineUsers: any[];

  unreadCounts: Record<string, number>;

  onSelectUser: (user: any) => void;
}

const Sidebar = ({
  conversations,
  currentUser,
  selectedUser,
  onlineUsers,
  unreadCounts,
  onSelectUser,
}: Props) => {
  const createRoomId = (
    user1: string,

    user2: string,
  ) => {
    return [user1, user2]

      .sort()

      .join("-");
  };

  return (
    <div
      className="
        w-[300px]
        bg-slate-800
        border-r
        border-slate-700
        p-4
        overflow-y-auto
      "
    >
      <h1
        className="
          text-white
          text-2xl
          font-bold
          mb-4
        "
      >
        Chats
      </h1>

      {conversations
        .filter((u) => !(u._id === currentUser.id))
        .map((user) => {
          const isOnline = onlineUsers.some(
            (onlineUser) => onlineUser.userId === user._id,
          );

          const roomId = createRoomId(currentUser?.id, user._id);

          return (
            <div
              key={user._id}
              onClick={() => onSelectUser(user)}
              className={`
                bg-slate-700
                hover:bg-slate-600
                transition
                p-3
                rounded-xl
                mb-2
                cursor-pointer
                text-white
                flex
                justify-between
                items-center

                ${
                  selectedUser?._id === user._id
                    ? "border-2 border-blue-500"
                    : ""
                }
              `}
            >
              <div>
                <p
                  className="
                    font-semibold
                  "
                >
                  {user.name}
                </p>

                <p
                  className="
                    text-sm
                    text-gray-300
                    truncate
                    max-w-[180px]
                  "
                >
                  {user.lastMessage?.text || "No messages yet"}
                </p>
              </div>

              <div
                className="
                  flex
                  flex-col
                  items-end
                  gap-1
                "
              >
                <div
                  className={`
                    w-3
                    h-3
                    rounded-full

                    ${isOnline ? "bg-green-500" : "bg-gray-500"}
                  `}
                />

                <p
                  className="
                    text-xs
                    text-gray-400
                  "
                >
                  {user.lastMessage?.time}
                </p>

                {unreadCounts[roomId] > 0 && (
                  <div
                    className="
                      bg-red-500
                      text-white
                      text-xs
                      min-w-[20px]
                      h-5
                      px-1
                      rounded-full
                      flex
                      items-center
                      justify-center
                    "
                  >
                    {unreadCounts[roomId]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default Sidebar;
