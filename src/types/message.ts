export interface Message {
  _id: string;

  sender: string;

  room: string;

  text: string;

  name: string;

  time: string;

  status: "sent" | "delivered" | "seen";

  createdAt: string;
}
