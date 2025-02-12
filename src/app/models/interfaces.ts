export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Message {
  sender: string;
  messageText: string;
  timestamp: number;
}

export interface WebSocketMessage {
  type: string;
  websocketMessageText: string;
  sender: string;
}
