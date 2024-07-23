import { ComponentProps, useEffect } from "react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chat } from "../data";
import { atom, useAtom } from "jotai";
import { useChats } from "@/context";
import { useGetChat } from "../hooks/queries";
//import { useChat } from "../use-chat";

interface ChatListProps {
  items: Chat[];
}

export default function ChatList({ items }: ChatListProps) {
  const { chat, setChat, setMessages } = useChats();
  const { data: messages, refetch, status } = useGetChat(chat?._id || null);

  const handleMessages = (chat: Chat) => {
    setChat(chat);
    refetch();
  };

  useEffect(() => {
    console.log(status);
    refetch();
    console.log(messages);
    if (messages) {
      setMessages(messages);
    }
  }, [refetch, chat, messages]);

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items &&
          items.length > 0 &&
          items.map((item) => (
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
                    <div className="font-semibold">{item.user.name}</div>
                    {false && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
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
                <div className="text-xs font-medium">
                  {item.lastMessageText}
                </div>
              </div>
              <div className="line-clamp-2 text-xs text-muted-foreground">
                {item.lastMessageText.substring(0, 300)}
              </div>

              <div className="flex items-center gap-2">
                {item.archived && <Badge variant="default">archived</Badge>}
                {item.seen && <Badge variant="default">seen</Badge>}
                {item.muted && <Badge variant="default">muted</Badge>}
              </div>
            </button>
          ))}
      </div>
    </ScrollArea>
  );
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
