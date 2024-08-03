import { ScrollArea } from "@/components/ui/scroll-area";
import { Group } from "../hooks/type";
import { cn } from "@/lib/utils";
import { useChats } from "@/context";
import { CheckCheck } from "lucide-react";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGetGroup } from "../hooks/queries";
import { useEffect, useRef } from "react";

export default function GroupList({ groups }: { groups: Group[] }) {
  const initialFetchRef = useRef(false);
  const { chat, setMessages, setGroup, group } = useChats();
  const { data: messages, refetch } = useGetGroup(group?._id || null);

  const handleMessages = (group: Group) => {
    setMessages([]);
    setGroup(group);
    refetch();
  };
  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      refetch();
    } else if (messages) {
      setMessages(messages ?? []);
      initialFetchRef.current = false;
    }
  }, [refetch, chat, messages]);

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {groups &&
          groups.length > 0 &&
          groups.map((item) => (
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

                    {/* <span
                        className={`flex h-2 w-2 rounded-full ${item.online ? "bg-green-600" : "bg-blue-600"}`}
                      /> */}
                  </div>
                  <div
                    className={cn(
                      "ml-auto text-xs",
                      chat && chat._id === item._id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.typing ? "Typing..." : "Now"}
                  </div>
                </div>

                <div className="text-xs font-medium flex gap-1 flex-row items-center justify-between">
                  <div className="flex flex-row gap-2 line-clamp-2 mt-3 text-base text-muted-foreground">
                    {item.isLastMessageByMe &&
                      (item.delivered && item.seen ? (
                        <CheckCheck
                          className="h-4 w-4"
                          color={item.delivered && item.seen ? "blue" : "gray"}
                        />
                      ) : item.delivered ? (
                        <CheckCheck className="h-4 w-4" color={"gray"} />
                      ) : (
                        <Check className="h-4 w-4" color={"gray"} />
                      ))}

                    {(item.lastMessageText ?? "No msgs yet").substring(0, 300)}
                  </div>
                  {item.unreadCount > 0 && (
                    <p className="bg-white rounded-full text-base w-8 h-8 p-2 text-black leading-none">
                      {item.unreadCount}
                    </p>
                  )}
                </div>
              </div>
              <p className="mr-auto text-xs text-muted-foreground">
                {item._id}
              </p>
              <div className="flex items-center gap-2">
                {item.isInTheRoom && (
                  <Badge variant="default">✔ User in the room</Badge>
                )}
                {item.archived && <Badge variant="default">archived</Badge>}
                {item.muted && <Badge variant="default">muted</Badge>}
              </div>
            </button>
          ))}
      </div>
    </ScrollArea>
  );
}
