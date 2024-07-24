interface Contact {
  _id: string;
  name: string;
}

interface Chat {
  _id: string;
  categoryId: string;
  privacy: string;
  type: string;
  archived: string[];
  contacts: Contact[];
  createdAt: string;
  locked: string[];
  muted: string[];
  participants: string[];
  updatedAt: string;
  lastMessage: string;
}

export interface Message {
  _id: string;
  ownerUserId: string;
  text: string;
  chatId: string;
  groupId: string | null;
  seen: boolean;
  delivered: boolean;
  seenAuth: string[];
  deliveredAuth: string[];
  attachments: any[];
  isDeleted: boolean;
  isReply: boolean;
  type: number;
  media: any[];
  love: string[];
  wow: string[];
  sad: string[];
  angry: string[];
  like: string[];
  sharesCount: number;
  likesCount: number;
  loveCount: number;
  wowCount: number;
  sadCount: number;
  angryCount: number;
  createdAt: string;
  updatedAt: string;
  byMe: boolean;
}

export interface MessageProp {
  messages: Message[];
  chat: Chat;
}
