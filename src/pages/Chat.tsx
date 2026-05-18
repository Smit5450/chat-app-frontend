import { useEffect, useRef, useState } from "react";
import type { Message } from "../types/message";
import api from "../services/api.ts";
import { useAuth } from "../context/AuthContext.tsx";
import MessageList from "../components/MessageList.tsx";
import ChatInput from "../components/ChatInput.tsx";
import Sidebar from "../components/Sidebar.tsx";
import useSocket from "../hooks/useSocket.ts";
import { socket } from "../services/socket.ts";
import type { User } from "../types/user.ts";
import type { Conversation } from "../types/conversation.ts";

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

    socket.emit(
      "getRoomMessages",

      roomId,

      (messages: Message[]) => {
        setMessages(messages);
      },
    );
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
  });

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
        const response = await api.get("/auth/users");

        setUsers(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUsers();
  }, []);

  const sendMessage = () => {
    if (!message.trim()) {
      return;
    }

    // const newMessage = {
    //     text: message,
    //     time:
    //         new Date()
    //             .toLocaleTimeString(),
    // };
    // socket.emit(
    //     'message',
    //     newMessage,
    // );

    const roomId = createRoomId(currentUser.id, selectedUser._id);

    socket.emit(
      "privateMessage",

      {
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

  return (
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

          <MessageList
            messages={messages}
            currentUser={currentUser}
            onDelete={handleDeleteMessage}
          />

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
  );

  //   return (
  //
  // //       <div
  // //           className="
  // //       min-h-screen
  // //       bg-slate-900
  // //       flex
  // //       flex-col
  // //       items-center
  // //       py-10
  // //       px-4
  // //     "
  // //       >
  // //
  // //           <h1
  // //               className="
  // //               text-4xl
  // //               text-white
  // //               font-bold
  // //               mb-8
  // //               "
  // //           >
  // //               Realtime Chat
  // //           </h1>
  // //
  // //           <div
  // //               className="
  // //                w-full
  // //                max-w-2xl
  // //                 bg-slate-800
  // //                rounded-2xl
  // //                p-6
  // //                flex
  // //                flex-col
  // //                gap-4
  // //                h-175
  // //               "
  // //           >
  // //
  // //               <div
  // //                   className="
  // //                   {/*w-full*/}
  // //                   {/*max-w-2xl*/}
  // //                   mb-4
  // //                   text-white
  // //                    "
  // //               >
  // //
  // //                   <h2
  // //                       className="
  // //                         {/*text-lg*/}
  // //                         font-semibold
  // //                         mb-2
  // //                       "
  // //                   >
  // //                       Online Users
  // //                   </h2>
  // //
  // //                   <div
  // //                       className="
  // //                         flex
  // //                         gap-2
  // //                         flex-wrap
  // //                       "
  // //                   >
  // //
  // //                       {
  // //                           onlineUsers.map(
  // //                               (user,index) => (
  // //
  // //                                   <div
  // //                                       key={index}
  // //                                       onClick={() => {
  // //                                           setSelectedUser(user);
  // //                                           const roomId = createRoomId(currentUser.userId, user.userId,);
  // //                                           socket.emit(
  // //                                               'joinRoom',
  // //                                               roomId,
  // //                                           );
  // //                                           setMessages([]);
  // //                                           socket.emit(
  // //                                               'getRoomMessages',
  // //                                               roomId,
  // //                                               (messages: Message[]) => {
  // //                                                   setMessages(
  // //                                                       messages,
  // //                                                   );
  // //                                               },
  // //                                           );
  // //                                       }}
  // //                                       className="
  // //                                         bg-green-600
  // //                                         px-3
  // //                                         py-1
  // //                                         rounded-full
  // //                                         text-sm
  // //                                       "
  // //                                   >
  // //
  // //                                       {user.name}
  // //
  // //                                   </div>
  // //                               ),
  // //                           )
  // //                       }
  // //
  // //                   </div>
  // //
  // //               </div>
  // //
  // //               <div
  // //                   className="
  // //   flex
  // //   justify-between
  // //   items-center
  // //   {/*mb-4*/}
  // // "
  // //               >
  // //
  // //                   <h1
  // //                       className="
  // //     text-white
  // //     text-xl
  // //     font-bold
  // //   "
  // //                   >
  // //
  // //                       Welcome,
  // //                       {` `}
  // //                       {user?.name}
  // //
  // //                   </h1>
  // //
  // //                   <button
  // //
  // //                       onClick={logout}
  // //
  // //                       className="
  // //     bg-red-500
  // //     px-4
  // //     py-2
  // //     rounded-xl
  // //     text-white
  // //   "
  // //                   >
  // //
  // //                       Logout
  // //
  // //                   </button>
  // //
  // //               </div>
  // //
  // //               <div
  // //                   className="
  // //           flex-1
  // //           overflow-y-auto
  // //           space-y-3
  // //         "
  // //               >
  // //
  // //                   {
  // //                       messages.map(
  // //                           (
  // //                               msg,
  // //                               index,
  // //                           ) =>
  // //                           {
  // //                               console.log("==user==>>> ", user)
  // //                               const isOwnMessage = msg.sender === user.name;
  // //                               console.log("isOwnMessage===? ", isOwnMessage);
  // //                               return (
  // //                               <div
  // //                                   key={index}
  // //                                   className={`
  // //                                   px-4
  // //                                   py-3
  // //                                   rounded-xl
  // //                                   max-w-[80%]
  // //                                   ${
  // //                                       isOwnMessage
  // //                                           ? `
  // //                                   bg-blue-500
  // //                                   text-white
  // //                                   ml-auto
  // //                                   `
  // //                                           : `
  // //                                   bg-slate-700
  // //                                   text-white
  // //                                   `
  // //                                   }
  // //                               `}
  // //                               >
  // //
  // //                                   <div>
  // //                                       <div
  // //                                           className="
  // //                                       text-sm
  // //                                       text-slate-300
  // //                                       mb-1
  // //                                        "
  // //                                       >
  // //                                           {msg.sender}
  // //                                       </div>
  // //
  // //                                       <div>
  // //                                           {msg.text}
  // //                                       </div>
  // //
  // //                                       <div
  // //                                           className="
  // //                                       text-xs
  // //                                       text-slate-400
  // //                                       mt-1
  // //                                       "
  // //                                       >
  // //                                           {msg.time}
  // //                                       </div>
  // //
  // //                                   </div>
  // //                                   <div ref={messagesEndRef} />
  // //                               </div>
  // //                           )},
  // //                       )
  // //                   }
  // //
  // //               </div>
  // //
  // //               <div
  // //                   className="
  // //                   flex
  // //                   gap-3
  // //                   "
  // //               >
  // //
  // //                   <input
  // //
  // //                       type="text"
  // //
  // //                       value={message}
  // //
  // //                       onChange={(e) =>
  // //                           setMessage(
  // //                               e.target.value,
  // //                           )
  // //                       }
  // //
  // //                       placeholder="Type message..."
  // //
  // //                       onKeyDown={(e) => {
  // //
  // //                           if (e.key === 'Enter') {
  // //                               sendMessage();
  // //                           }
  // //
  // //                       }}
  // //
  // //                       className="
  // //                       flex-1
  // //                       px-4
  // //                       py-3
  // //                       rounded-xl
  // //                       bg-slate-700
  // //                       text-white
  // //                       outline-none
  // //                       "
  // //                   />
  // //
  // //                   <button
  // //
  // //                       onClick={sendMessage}
  // //
  // //                       className="
  // //                       bg-blue-500
  // //                       hover:bg-blue-600
  // //                       px-6
  // //                       rounded-xl
  // //                       text-white
  // //                       font-semibold
  // //                       "
  // //                   >
  // //
  // //                       Send
  // //
  // //                   </button>
  // //
  // //               </div>
  // //
  // //           </div>
  // //
  // //       </div>
  //   );
}

export default Chat;
