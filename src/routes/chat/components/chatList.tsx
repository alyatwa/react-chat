import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chat } from "../data";
import { useChats } from "@/context";
import { useGetChat } from "../hooks/queries";
import { ws } from "@/ws";
import { CheckCheck } from "lucide-react";
//import { useChat } from "../use-chat";

const USER_STATUS_TIMEOUT = 20000;

export default function ChatList() {
  const { chat, setChat, setMessages, chats, setChats } = useChats();
  const { data: messages, refetch } = useGetChat(chat?._id || null);

  const handleMessages = (chatH: Chat) => {
    if (chatH._id === (chat?._id ?? "")) return;
    setMessages([]);
    setChat(chatH);
    refetch();
    ws.emit("Chat:joinRoom", JSON.stringify({ chatId: chatH._id }));
  };

  useEffect(() => {
    ///console.log("eff...............", messages);
    if ((messages ?? []).length < 1) {
      refetch();
    }
    if (messages) {
      setMessages(messages ?? []);
    }
  }, [refetch, chat, messages]);

  useEffect(() => {
    const data: {
      archived?: boolean;
      privacy?: string;
      isLocked?: boolean;
      categoryId?: string;
    } = {
      archived: false,
      privacy: "normal",
      categoryId: "668e7dc4e8cfec5bcc752afc",
    };
    initStatus();
    setInterval(() => {
      ws.emit("Chat:usersStatus", JSON.stringify(data));
    }, USER_STATUS_TIMEOUT);
  }, []);

  const [status, setStatus] = useState<any>([]);
  const statusRef = useRef<any[] | null>(status);
  const [isFirstUpdate, setIsFirstUpdate] = useState(false);

  useEffect(() => {
    initStatus();
  }, [status, isFirstUpdate]);

  const initStatus = () => {
    if ((status ?? []).length > 0 && !isFirstUpdate) {
      setIsFirstUpdate(false); // Mark that the first update has occurred
    } else {
      setIsFirstUpdate(true);
    }
    statusRef.current = status;
  };

  const updateStatus = (socketData: string) => {
    const data = JSON.parse(socketData) as {
      userId: string;
      online: boolean;
      chatId: string;
    }[];
    //console.log("users status..   ", data);
    //add each status to the chat
    setChats((prev) => {
      return (prev ?? []).map((chat) => {
        const status = data.find((s) => s.chatId === chat._id);
        if (status) {
          return { ...chat, online: status.online };
        }
        return chat;
      });
    });
    setStatus(data);
  };

  useEffect(() => {
    if (isFirstUpdate) {
      console.log("start status listen socket");
      ws.on("usersStatus", updateStatus);

      return () => {
        console.log("end status listen socket");
        ws.off("usersStatus", updateStatus);
      };
    }
  }, [isFirstUpdate]);

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {chats &&
          chats.length > 0 &&
          chats.map((item) => (
            <button
              key={item._id}
              className={cn(
                "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
                chat && chat._id === item._id && "bg-muted"
              )}
              onClick={() => handleMessages(item)}
            >
              <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{item.name}</div>

                    <span
                      className={`flex h-2 w-2 rounded-full ${item.online ? "bg-green-600" : "bg-blue-600"}`}
                    />
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      chat && chat._id === item._id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatDistanceToNow(new Date(), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="text-xs font-medium flex gap-1 flex-row items-center justify-between">
                  <div className="flex flex-row gap-2 line-clamp-2 mt-3 text-base text-muted-foreground">
                    {item.isLastMessageByMe && (
                      <CheckCheck
                        className="h-5 w-5"
                        color={item.seen ? "blue" : "gray"}
                      />
                    )}
                    {(item.lastMessageText ?? "No msgs yet").substring(0, 300)}
                  </div>

                  {item.unreadCount > 0 && (
                    <p className="bg-white rounded-full text-base w-8 h-8 p-2 text-black leading-none">
                      {item.unreadCount}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.archived && <Badge variant="default">archived</Badge>}
                {item.muted && <Badge variant="default">muted</Badge>}
              </div>
            </button>
          ))}
      </div>
    </ScrollArea>
  );
}
