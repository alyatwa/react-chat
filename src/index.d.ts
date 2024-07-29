interface IMessage {
  _id: string;
  ownerUserId: string;
  replyMessageId?: string;
  isReply?: boolean;
  isDeleted?: boolean;
  createdAt?: Date;
  //contactUserId?: string;
  chatId: string;
  groupId?: string;
  //senderContactId: string;
  //receiverContactId: string;
  type: number;
  text: string;
  seen?: string[];
  delivered?: string[];
  deleteAt?: Date;
  media?: string[] | null;
}
