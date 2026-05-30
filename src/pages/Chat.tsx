import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/message";
import { useAuth } from "../context/AuthContext.tsx";
import MessageList from "../components/MessageList.tsx";
import ChatInput from "../components/ChatInput.tsx";
import Sidebar from "../components/Sidebar.tsx";
import useSocket from "../hooks/useSocket.ts";
import { socket } from "../services/socket.ts";
import type { User } from "../types/user.ts";
import type { Conversation } from "../types/conversation.ts";
import { getUsers } from "../services/chat.service.ts";
import toast from "react-hot-toast";
import SkeletonMessage from "../components/SkeletonMessage.tsx";

function Chat() {
  const { logout, user: currentUser } = useAuth();

  const [message, setMessage] = useState<Message>("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const [users, setUsers] = useState<User[]>([]);

  const [typingUser, setTypingUser] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>[]>(
    {},
  );

  const [selectedUser, setSelectedUser] = useState<User>(null);

  const [messagesLoading, setMessagesLoading] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("connecting");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [selectedUser, setSelectedUser] = useState<User>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const createRoomId = (user1: string, user2: string) => {
    console.log("createRoomId for ==> ", { user1, user2 });
    return [user1, user2].sort().join("-");
  };

  const handleDeleteMessage = (messageId: string) => {
    socket.emit(
      "deleteMessage",

      messageId,
    );
  };

  const handleTyping = () => {
    if (selectedUser) {
      const roomId = createRoomId(
        currentUser?.id,

        selectedUser._id,
      );
      socket.emit("typing", {
        room: roomId,
        name: currentUser?.name,
      });
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);

    setMessages([]);

    const roomId = createRoomId(currentUser?.id, user._id);

    setUnreadCounts((prev) => ({
      ...prev,

      [roomId]: 0,
    }));

    console.log("==roomId==> ", roomId);
    socket.emit("joinRoom", roomId);

    socket.emit(
      "seenMessages",

      roomId,
    );
    setMessagesLoading(true);
    socket.emit(
      "getRoomMessages",

      roomId,

      (messages: Message[]) => {
        setMessages(messages);
        setMessagesLoading(false);
      },
    );
    setIsChatOpen(true);
  };

  const buildConversations = () => {
    const conversationData = users

      .filter((u) => u._id !== currentUser?.userId)

      .map((user) => {
        const roomId = createRoomId(
          currentUser?.id,

          user._id,
        );

        const roomMessages = messages.filter(
          (message) => message.room === roomId,
        );

        const lastMessage = roomMessages[roomMessages.length - 1];

        return {
          ...user,

          lastMessage,
        };
      })

      .sort((a, b) => {
        if (!a.lastMessage) return 1;

        if (!b.lastMessage) return -1;

        return (
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
        );
      });

    setConversations(conversationData);
  };

  useSocket({
    onMessage: (message) => {
      setMessages((prev) => [...prev, message]);

      const activeRoom = selectedUser
        ? createRoomId(currentUser?.id, selectedUser?._id)
        : "";

      if (message.room !== activeRoom) {
        setUnreadCounts((prev) => ({
          ...prev,

          [message.room]: (prev[message.room] || 0) + 1,
        }));
      }
    },

    onOnlineUsers: (users) => {
      setOnlineUsers(users);
    },

    onTyping: (name) => {
      setTypingUser(name);

      setTimeout(() => {
        setTypingUser("");
      }, 1500);
    },

    onMessagesSeen: () => {
      setMessages((prev) =>
        prev.map((message) => ({
          ...message,

          status: "seen",
        })),
      );
    },

    onMessageDeleted: (messageId) => {
      setMessages((prev) =>
        prev.filter((message) => message._id !== messageId),
      );
    },

    onGetMessages: (data) => {
      console.log("data===> ", data);
      setMessages((prev) => [...prev, data]);
    },

    onGetUsers: (users) => {
      setOnlineUsers(users);
    },

    onConnect: () => {
      setConnectionStatus("connected");
    },

    onDisconnect: () => {
      setConnectionStatus("disconnected");
      // toast.error("Disconnected");
    },

  // useEffect(() => {
  //   connectSocket();
  //   socket.on("message", (data: Message) => {
  //     setMessages((prev) => [...prev, data]);
  //   });
  //
  //   socket.on("users", (users: string[]) => {
  //     setOnlineUsers(users);
  //   });
  //
  //   // socket.on(
  //   //   "onlineUsers",
  //   //
  //   //   (users) => {
  //   //     setOnlineUsers(users);
  //   //   },
  //   // );
  // }, []);

  // useEffect(() => {
  //   newSocket.on(
  //     "privateMessage",
  //
  //     (message) => {
  //       setMessages((prev) => [...prev, message]);
  //       const activeRoom = selectedUser
  //         ? createRoomId(currentUser?.id, selectedUser?._id)
  //         : "";
  //
  //       if (message.room !== activeRoom) {
  //         setUnreadCounts((prev) => ({
  //           ...prev,
  //
  //           [message.room]: (prev[message.room] || 0) + 1,
  //         }));
  //       }
  //     },
  //   );
  //
  //   newSocket.on(
  //     "typing",
  //
  //     (name) => {
  //       setTypingUser(name);
  //
  //       setTimeout(() => {
  //         setTypingUser("");
  //       }, 10000);
  //     },
  //   );
  //
  //   newSocket.on("messagesSeen", () => {
  //     setMessages((prev) =>
  //       prev.map((message) => ({
  //         ...message,
  //         status: "seen",
  //       })),
  //     );
  //   });
  //
  //   newSocket.on(
  //     "messageDeleted",
  //
  //     (messageId) => {
  //       setMessages((prev) =>
  //         prev.filter((message) => message._id !== messageId),
  //       );
  //     },
  //   );
  //
  //   return () => {
  //     newSocket.off("message");
  //     newSocket.off("users");
  //   };
  // }, []);

  useEffect(() => {
    buildConversations();
  }, [messages, users]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/me");

        console.log(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getUsers();

        setUsers(response);
      } catch (error) {
        // console.log(error);
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  const sendMessage = () => {
    if (!message.trim()) {
      return;
    }

    const roomId = createRoomId(currentUser.id, selectedUser._id);

    socket.emit(
      "privateMessage",

      {
        receiverId: selectedUser._id,
        text: message,
        room: roomId,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    );

    setMessage("");
    setUnreadCounts({});
  };

  useEffect(() => {
    const handleOffline = () => {
      setConnectionStatus("disconnected");
    };

    const handleOnline = () => {
      setConnectionStatus("connected");
    };

    window.addEventListener(
      "offline",

      handleOffline,
    );

    window.addEventListener(
      "online",

      handleOnline,
    );

    return () => {
      window.removeEventListener(
        "offline",

        handleOffline,
      );

      window.removeEventListener(
        "online",

        handleOnline,
      );
    };
  }, []);

  return (
    <>
      {connectionStatus !== "connected" && (
        <div
          className={`
        text-white
        text-center
        py-2

        ${connectionStatus === "connecting" ? "bg-yellow-500" : "bg-red-500"}
      `}
        >
          {connectionStatus === "connecting" ? "Connecting..." : "Disconnected"}
        </div>
      )}
      <div
        className="
      h-screen
      bg-slate-900
      flex
    "
      >
        {/* SIDEBAR */}

      <Sidebar
        conversations={conversations}
        currentUser={currentUser}
        selectedUser={selectedUser}
        onlineUsers={onlineUsers}
        unreadCounts={unreadCounts}
        onSelectUser={handleSelectUser}
      />

      {/*    <div*/}
      {/*      className="*/}
      {/*      w-[300px]*/}
      {/*      bg-slate-800*/}
      {/*      border-r*/}
      {/*      border-slate-700*/}
      {/*      p-4*/}
      {/*      overflow-y-auto*/}
      {/*    "*/}
      {/*    >*/}
      {/*      <p>Welcome {currentUser.name}!</p>*/}

      {/*      <h1*/}
      {/*        className="*/}
      {/*        text-white*/}
      {/*        text-2xl*/}
      {/*        font-bold*/}
      {/*        mb-4*/}
      {/*      "*/}
      {/*      >*/}
      {/*        Chats*/}
      {/*      </h1>*/}

      {/*      {conversations*/}
      {/*        .filter((u) => u._id !== currentUser?.id)*/}

      {/*        .map((user) => {*/}
      {/*          const isOnline = onlineUsers.some(*/}
      {/*            (onlineUser) => onlineUser.userId === user._id,*/}
      {/*          );*/}

      {/*          const roomId = createRoomId(currentUser?.id, user._id);*/}

      {/*          return (*/}
      {/*            <div*/}
      {/*              key={user._id}*/}
      {/*              onClick={() => {*/}
      {/*                setSelectedUser(user);*/}

      {/*                setMessages([]);*/}

      {/*                const roomId = createRoomId(currentUser?.id, user._id);*/}

      {/*                setUnreadCounts((prev) => ({*/}
      {/*                  ...prev,*/}
      {/*                  [roomId]: 0,*/}
      {/*                }));*/}

      {/*                socket.emit("joinRoom", roomId);*/}

      {/*                socket.emit(*/}
      {/*                  "getRoomMessages",*/}
      {/*                  roomId,*/}
      {/*                  (messages: Message[]) => {*/}
      {/*                    setMessages(messages);*/}
      {/*                  },*/}
      {/*                );*/}

      {/*                socket.emit("seenMessages", roomId);*/}
      {/*              }}*/}
      {/*              className={`*/}
      {/*              bg-slate-700*/}
      {/*              hover:bg-slate-600*/}
      {/*              transition*/}
      {/*              p-3*/}
      {/*              rounded-xl*/}
      {/*              mb-2*/}
      {/*              cursor-pointer*/}
      {/*              text-white*/}
      {/*              flex*/}
      {/*              justify-between*/}
      {/*              items-center*/}
      {/*              ${*/}
      {/*                selectedUser?._id === user._id*/}
      {/*                  ? "border-2 border-blue-500"*/}
      {/*                  : ""*/}
      {/*              }*/}
      {/*            `}*/}
      {/*            >*/}
      {/*              <div>*/}
      {/*                <p>{user.name}</p>*/}

      {/*                <p*/}
      {/*                  className="*/}
      {/*  text-sm*/}
      {/*  text-gray-300*/}
      {/*  truncate*/}
      {/*  max-w-[180px]*/}
      {/*"*/}
      {/*                >*/}
      {/*                  {user.lastMessage?.text || "No messages yet"}*/}
      {/*                </p>*/}
      {/*              </div>*/}

      {/*              {unreadCounts[roomId] > 0 && (*/}
      {/*                <div*/}
      {/*                  className="*/}
      {/*    bg-red-500*/}
      {/*    text-white*/}
      {/*    text-xs*/}
      {/*    min-w-[20px]*/}
      {/*    h-5*/}
      {/*    px-1*/}
      {/*    rounded-full*/}
      {/*    flex*/}
      {/*    items-center*/}
      {/*    justify-center*/}
      {/*  "*/}
      {/*                >*/}
      {/*                  {unreadCounts[roomId]}*/}
      {/*                </div>*/}
      {/*              )}*/}

      {/*              <div*/}
      {/*                className={`*/}
      {/*                w-3*/}
      {/*                h-3*/}
      {/*                rounded-full*/}

      {/*                ${isOnline ? "bg-green-500" : "bg-gray-500"}*/}
      {/*              `}*/}
      {/*              />*/}
      {/*            </div>*/}
      {/*          );*/}
      {/*        })}*/}
      {/*    </div>*/}

      {/* CHAT PANEL */}

      {selectedUser ? (
        <div
          className="
                flex-1
                flex
                flex-col
                p-4
              "
          >
            {/* TOP BAR */}

            <div
              className="
          flex
          justify-between
          items-center
          mb-4
        "
            >
              <h1
                className="
            text-white
            text-2xl
            font-bold
          "
              >
                {selectedUser ? selectedUser.name : "Select Chat"}
              </h1>

              <button
                onClick={logout}
                className="
            bg-red-500
            px-4
            py-2
            rounded-xl
            text-white
          "
              >
                Logout
              </button>
            </div>

            {/* MESSAGES */}

            {!messages.length && !messagesLoading && (
              <div
                className="
    h-full
    flex
    flex-col
    items-center
    justify-center
    text-gray-400
    gap-3
  "
              >
                <div
                  className="
      text-5xl
    "
                >
                  💬
                </div>

                <p>No messages yet</p>

                <p
                  className="
      text-sm
    "
                >
                  Start the conversation
                </p>
              </div>
            )}

            {messagesLoading ? (
              <SkeletonMessage />
            ) : (
              <MessageList
                messages={messages}
                currentUser={currentUser}
                onDelete={handleDeleteMessage}
              />
            )}
            {/* INPUT */}

            {typingUser && (
              <p
                className="
      text-gray-400
      text-sm
      italic
      mb-2
    "
              >
                {typingUser} is typing...
              </p>
            )}
            <ChatInput
              input={message}
              setInput={setMessage}
              sendMessage={sendMessage}
              onTyping={handleTyping}
            />
          </div>
        ) : (
          <div
            className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  text-gray-400
                  text-xl
                "
          >
            Select a chat to start messaging
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;
