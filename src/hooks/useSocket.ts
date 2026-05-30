import { useEffect } from "react";

import { socket, connectSocket, disconnectSocket } from "../services/socket.ts";
import type { Message } from "../types/message.ts";

const useSocket = (handlers: {
  onMessage: (message: Message) => void;

  onOnlineUsers: (users: any[]) => void;

  onTyping: (name: string) => void;

  onMessagesSeen: () => void;

  onMessageDeleted: (id: string) => void;

  onGetMessages: (data: any) => void;

  onGetUsers: (users: any) => void;

  onConnect: () => void;

  onDisconnect: () => void;

  // onReconnect: () => void;
}) => {
  useEffect(() => {
    connectSocket();

    socket.on(
      "message",

      handlers.onGetMessages,
    );

    socket.on(
      "users",

      handlers.onGetUsers,
    );

    socket.on(
      "privateMessage",

      handlers.onMessage,
    );

    socket.on(
      "onlineUsers",

      handlers.onOnlineUsers,
    );

    socket.on(
      "typing",

      handlers.onTyping,
    );

    socket.on(
      "messagesSeen",

      handlers.onMessagesSeen,
    );

    socket.on(
      "messageDeleted",

      handlers.onMessageDeleted,
    );

    socket.on(
      "connect",

      handlers.onConnect,
    );

    socket.on(
      "disconnect",

      handlers.onDisconnect,
    );

    // socket.io.on(
    //   "reconnect",
    //
    //   handlers.onReconnect,
    // );

    return () => {
      socket.off("privateMessage");

      socket.off("onlineUsers");

      socket.off("typing");

      socket.off("messagesSeen");

      socket.off("messageDeleted");

      socket.off("message");

      socket.off("users");

      socket.off("connect");

      socket.off("disconnect");

      // socket.io.off("reconnect");
    };
  }, []);
};

export default useSocket;
