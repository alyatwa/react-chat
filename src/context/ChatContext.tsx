import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

import { Chat } from "@/routes/chat/data";
//import { useGetChats } from "@/routes/chat/hooks/queries";
import { Group, Message } from "@/routes/chat/hooks/type";

type TChatContext = {
  /*  chats: Chat[];
  isLoading: boolean; */
  group: any;
  setGroup: Dispatch<SetStateAction<any>>;
  filter: any;
  chats: Chat[] | null;
  setFilter: Dispatch<SetStateAction<any | null>>;
  setChats: Dispatch<SetStateAction<Chat[] | null>>;
  chat: Chat | null;
  messages: Message[] | null;
  setChat: Dispatch<SetStateAction<Chat | null>>;
  setMessages: Dispatch<SetStateAction<Message[] | null>>;
};

const ChatContext = createContext<TChatContext | null>(null);

type Props = {
  children: ReactNode;
};

export const ChatProvider = ({ children }: Props): JSX.Element => {
  //const { data, isLoading } = useGetChats();
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [filter, setFilter] = useState({
    privacy: "normal",
    categoryId: "668e7dc4e8cfec5bcc752afc",
    archived: false,
  });
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  // memorize the workspace details for the context
  const value = {
    chat,
    setChat,
    group,
    setGroup,
    filter,
    setFilter,
    messages,
    setMessages,
    chats,
    setChats,
    /*  chats: data || [],
      isLoading, */
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChats = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChats has to be used within <ChatContext.Provider>");
  }

  return ctx;
};
