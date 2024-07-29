import { Check, Plus, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChats } from "@/context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ws } from "@/ws";
import { useEffect, useRef, useState } from "react";
import { Message } from "../hooks/type";
import { CheckCheck } from "lucide-react";
import { ObjectId } from "bson";

const users = [
  {
    name: "Olivia Martin",
    email: "m@example.com",
    avatar: "/avatars/01.png",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    avatar: "/avatars/03.png",
  },
  {
    name: "Emma Wilson",
    email: "emma@example.com",
    avatar: "/avatars/05.png",
  },
  {
    name: "Jackson Lee",
    email: "lee@example.com",
    avatar: "/avatars/02.png",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    avatar: "/avatars/04.png",
  },
] as const;

type User = (typeof users)[number];

export default function ChatDisplay() {
  const [isTabActive, setIsTabActive] = useState(true);
  const isTabActiveRef = useRef(true);

  const { messages, setMessages, chat } = useChats();
  const messagesRef = useRef<Message[] | null>(messages);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  // Update the messagesRef.current on messages state change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isFirstUpdate, setIsFirstUpdate] = useState(false);

  useEffect(() => {
    if ((messages ?? []).length > 0 && !isFirstUpdate) {
      setIsFirstUpdate(true); // Mark that the first update has occurred
    }
    messagesRef.current = messages;
  }, [messages, isFirstUpdate]);

  const [input, setInput] = useState("");
  const inputLength = input.trim().length;

  const sendMessage = () => {
    if (inputLength === 0) return;
    const messageId = new ObjectId().toHexString();
    setMessages([
      ...(messagesRef.current || []),
      {
        byMe: true,
        text: input,
        _id: messageId,
        ownerUserId: "",
        chatId: "",
        groupId: null,
        seen: false,
        delivered: false,
        seenAuth: [],
        deliveredAuth: [],
        attachments: [],
        isDeleted: false,
        isReply: false,
        type: 0,
        media: [],
        love: [],
        wow: [],
        sad: [],
        angry: [],
        like: [],
        sharesCount: 0,
        likesCount: 0,
        loveCount: 0,
        wowCount: 0,
        sadCount: 0,
        angryCount: 0,
        createdAt: "",
        updatedAt: "",
      },
    ]);
    setInput("");
    scrollToBottom();
    ws.emit(
      "Message:Send",
      JSON.stringify({
        chatId: chat?._id,
        type: 1,
        mediaIds: [],
        messageId,
        text: input,
        groupId: null,
      })
    );
  };

  /***************** when user receive new message ************ */
  const newMessage = (msg: any) => {
    setMessages([
      ...(messagesRef.current || []),
      {
        _id: msg.message._id, // new ObjectId().toHexString(),
        byMe: false,
        text: msg.message.text,
        ownerUserId: "",
        chatId: "",
        groupId: null,
        seen: false,
        delivered: false,
        seenAuth: [],
        deliveredAuth: [],
        attachments: [],
        isDeleted: false,
        isReply: false,
        type: 0,
        media: [],
        love: [],
        wow: [],
        sad: [],
        angry: [],
        like: [],
        sharesCount: 0,
        likesCount: 0,
        loveCount: 0,
        wowCount: 0,
        sadCount: 0,
        angryCount: 0,
        createdAt: "",
        updatedAt: "",
      },
    ]);
    if (isTabActiveRef) {
      console.log("emit Delivered  >>>>");
      ws.emit("Message:Delivered", JSON.stringify({ chatId: chat?._id }));
    }
    console.log("emit Seen  >>>>");
    ws.emit("Message:Seen", JSON.stringify({ chatId: chat?._id }));
  };

  const listenerAddedRef = useRef(false);

  /*********************      Typing Now           ***************** */
  const [typing, setTyping] = useState(false);
  const typingRef = useRef<boolean>(false);
  const typingNow = () => {
    typingRef.current = true;
    setTyping(true);
  };
  /*********************    set msg to seen         ***************** */
  const messageSeen = (data: string) => {
    const seenMessages = JSON.parse(data) as IMessage[];
    if (seenMessages && seenMessages.length > 0 && isTabActiveRef.current) {
      console.log("listen messageSeen", seenMessages);
      //update messages state to seen true for each msg

      setMessages((prev) => {
        console.log("prev", prev);
        return (prev ?? []).map((msg) =>
          seenMessages.some((seenMsg) => seenMsg._id === msg._id)
            ? {
                ...msg,
                seen:
                  seenMessages.find(
                    (seenMessage) => seenMessage._id === msg._id
                  )?.seen ?? false,
              }
            : msg
        );
      });

      setMessages(() => {
        console.log("ref", messagesRef.current);
        return (messagesRef.current ?? []).map((msg) =>
          seenMessages.some((seenMsg) => seenMsg._id === msg._id)
            ? {
                ...msg,
                seen:
                  seenMessages.find(
                    (seenMessage) => seenMessage._id === msg._id
                  )?.seen ?? false,
              }
            : msg
        );
      });
    }
  };

  const messageDelivered = (data: string) => {
    const deliveredMessages = JSON.parse(data) as IMessage[];
    if (deliveredMessages && deliveredMessages.length > 0) {
      console.log("listen messageDelivered", deliveredMessages);
      //update messages state to delivered true for each msg
      setMessages((prev) => {
        return (prev ?? []).map((msg) =>
          deliveredMessages.some((deliveredMsg) => deliveredMsg._id === msg._id)
            ? {
                ...msg,
                delivered:
                  deliveredMessages.find(
                    (deliveredMsg) => deliveredMsg._id === msg._id
                  )?.delivered ?? false,
              }
            : msg
        );
      });
      setMessages(() => {
        return (messagesRef.current ?? []).map((msg) =>
          deliveredMessages.some((deliveredMsg) => deliveredMsg._id === msg._id)
            ? {
                ...msg,
                delivered:
                  deliveredMessages.find(
                    (deliveredMsg) => deliveredMsg._id === msg._id
                  )?.delivered ?? false,
              }
            : msg
        );
      });
    }
  };

  //timer to reset typing status
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setTyping(false);
      typingRef.current = false;
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [input, typing]);

  /*****************************  update last msg id   ****************************** */

  useEffect(() => {
    if (isFirstUpdate) {
      //  ws.on("messageSent", updateLastMsgId);
      ws.on("user:message", newMessage);
      ws.on("messageTyping", typingNow);
      ws.on("messageSeen", messageSeen);
      ws.on("messageDelivered", messageDelivered);

      listenerAddedRef.current = true;

      return () => {
        ws.off("user:message", newMessage);
        listenerAddedRef.current = false;
      };
    }
  }, [isFirstUpdate]);

  const handleTyping = () => {
    ws.emit("Message:Typing", JSON.stringify({ chatId: chat?._id }));
  };

  const chatRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView(false);
  };
  const divRef = useRef<HTMLDivElement | null>(null);

  const handleTabLeave = () => {
    setIsTabActive(false);
    isTabActiveRef.current = false;
  };
  const handleTabEnter = () => {
    setIsTabActive(true);
    isTabActiveRef.current = true;
    //console.log("on TabEnter emit Seen+Delivered  >>>>", JSON.stringify({ chatId: chat?._id }));
    ws.emit("Message:Seen", JSON.stringify({ chatId: chat?._id }));
    ws.emit("Message:Delivered", JSON.stringify({ chatId: chat?._id }));
  };
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isTabNowActive = !document.hidden;
      if (!isTabNowActive) {
        handleTabLeave();
      } else {
        handleTabEnter();
      }
    };
    const handleWindowBlur = () => {
      handleTabLeave();
    };
    const handleWindowFocus = () => {
      handleTabEnter();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  return (
    <div className="h-screen " ref={divRef}>
      <Card className="h-full relative">
        <CardHeader className="flex flex-row items-center">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src="https://ui.shadcn.com/avatars/02.png"
                alt="Image"
              />
              <AvatarFallback>OM</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">
                username {typing ? "Typing now..." : ""}{" "}
                {isTabActive ? " You see the chat" : "You left the chat"}
              </p>
              <p className="text-sm text-muted-foreground">Date</p>
            </div>
          </div>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="ml-auto rounded-full"
                  onClick={() => setOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">New message</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent sideOffset={10}>New message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[385px] ">
            <div className="space-y-4 h-full p-6" ref={chatRef}>
              {messages &&
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                      // eslint-disable-next-line no-constant-condition
                      message.byMe
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="flex flex-col justify-center items-end gap-1">
                      {message.text}
                      {message.byMe &&
                        (message.delivered && message.seen ? (
                          <CheckCheck
                            className="h-4 w-4"
                            color={
                              message.delivered && message.seen
                                ? "blue"
                                : "gray"
                            }
                          />
                        ) : (
                          <Check className="h-4 w-4" color={"gray"} />
                        ))}
                    </p>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="absolute  w-full">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (inputLength === 0) return;
              sendMessage();
            }}
            className="flex w-full items-center space-x-2 "
          >
            <Input
              id="message"
              placeholder="Type your message..."
              className="flex-1"
              autoComplete="off"
              value={input}
              onChange={(event) => {
                const newValue = event.target.value;
                setInput(newValue);

                if (newValue.length >= 3) {
                  handleTyping();
                }
              }}
            />
            <Button type="submit" size="icon" disabled={inputLength === 0}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-4 pb-4 pt-5">
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>
              Invite a user to this thread. This will create a new group
              message.
            </DialogDescription>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-t">
            <CommandInput placeholder="Search user..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup className="p-2">
                {users.map((user) => (
                  <CommandItem
                    key={user.email}
                    className="flex items-center px-2"
                    onSelect={() => {
                      if (selectedUsers.includes(user)) {
                        return setSelectedUsers(
                          selectedUsers.filter(
                            (selectedUser) => selectedUser !== user
                          )
                        );
                      }

                      return setSelectedUsers(
                        [...users].filter((u) =>
                          [...selectedUsers, user].includes(u)
                        )
                      );
                    }}
                  >
                    <Avatar>
                      <AvatarImage src={user.avatar} alt="Image" />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-sm font-medium leading-none">
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    {selectedUsers.includes(user) ? (
                      <Check className="ml-auto flex h-5 w-5 text-primary" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
            {selectedUsers.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden">
                {selectedUsers.map((user) => (
                  <Avatar
                    key={user.email}
                    className="inline-block border-2 border-background"
                  >
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select users to add to this thread.
              </p>
            )}
            <Button
              disabled={selectedUsers.length < 2}
              onClick={() => {
                setOpen(false);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
