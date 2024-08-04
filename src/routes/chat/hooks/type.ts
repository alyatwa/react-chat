interface Contact {
  _id: string;
  name: string;
}

export interface SuggestedFriend {
  _id: string;
  firstName: string;
  lastName: string;
  mutualFriendsCount: number;
  profilePicture: string;
}

export interface Group {
  _id: string;
  name: string;
  locked: boolean;
  muted: boolean;
  archived: boolean;
  lastMessageText: string;
  username: string;
  unreadCount: number;
  image: string;
  typing?: boolean;
  background: string;
  isLastMessageByMe?: boolean;
  delivered?: boolean;
  seen?: boolean;
  isInTheRoom?: boolean;
}

export interface GroupProps {
  messages: Message[];
  group: {
    _id: string;
    name: string;
    ownerId: string;
    members: string[];
    admins: string[];
    onlyAdminChat: boolean;
    onlyAdminAddMembers: boolean;
    locked: string[];
    muted: string[];
    archived: string[];
    createdAt: string;
    updatedAt: string;
  };
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
  groupId?: string | null;
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
