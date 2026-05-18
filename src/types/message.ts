export interface Message {
  _id: string;

  room: string;

  text: string;

  name: string;

  time: string;

  status: "sent" | "delivered" | "seen";

  createdAt: string;
}
