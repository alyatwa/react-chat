import { Check, Send } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { useChats } from "@/context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ws } from "@/ws";
import { useEffect, useRef, useState } from "react";
import { Message } from "../hooks/type";
import { CheckCheck } from "lucide-react";
import { ObjectId } from "bson";
import { useSendGreet } from "../hooks/queries";

export default function ChatDisplay() {
  const [isTabActive, setIsTabActive] = useState(true);
  const isTabActiveRef = useRef(true);
  const [input, setInput] = useState("");
  const { mutateAsync: sendGreet } = useSendGreet();
  const { messages, setMessages, chat, group, isGreet } = useChats();
  const messagesRef = useRef<Message[] | null>(messages);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update the messagesRef.current on messages state change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const [isFirstUpdate, setIsFirstUpdate] = useState(false);

  useEffect(() => {
    if ((messages ?? []).length > 0 && !isFirstUpdate) {
      setIsFirstUpdate(true); // Mark that the first update has occurred
    }
    messagesRef.current = messages;
  }, [messages, isFirstUpdate]);

  const inputLength = input.trim().length;

  const sendMessage = () => {
    if (inputLength === 0) return;
    const messageId = new ObjectId().toHexString();
    if (!isGreet) {
      updateMessages(messageId);
    }

    scrollToBottom();
    if (isGreet) {
      handleSendMessage(messageId); ///sendGreet({ userId: "", message: input });
    } else {
      ws.emit(
        "Message:Send",
        JSON.stringify({
          ...(chat ? { chatId: chat?._id } : {}),
          // chatId: chat?._id,
          type: 1,
          mediaIds: [],
          messageId,
          text: input,
          ...(group ? { groupId: group?._id ?? "" } : {}),
        })
      );
    }

    setInput("");
  };

  /********************** Handel greet ***************************** */
  const handleSendMessage = async (messageId: string) => {
    try {
      await sendGreet({
        userId: chat?.userId ?? "",
        message: input,
      }).then(() => {
        updateMessages(messageId);
      });
    } catch (error: any) {
      ///toast(`Error Greet  ${error.response.data.error.message}`);
      console.log("Error sending message: ", error.response.data.error.message);
    }
  };

  /**********************Update msgs*******************************/

  const updateMessages = (messageId: string) => {
    setMessages([
      ...(messagesRef.current || []),
      {
        byMe: true,
        text: input,
        _id: messageId,
        ownerUserId: "",
        chatId: "",

        ...(group ? { groupId: group?._id ?? "" } : {}),

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
  };

  /***************** when user receive new message ************ */
  const newMessage = (data: string) => {
    //console.log(msg);
    const msg = JSON.parse(data) as Message;
    if (msg.chatId != chat?._id) return;
    setMessages([
      ...(messagesRef.current || []),
      {
        _id: msg._id, // new ObjectId().toHexString(),
        byMe: false,
        text: msg.text,
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
      ws.emit("Message:Delivered", JSON.stringify({ chatId: chat?._id }));
    }
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
    if (seenMessages && seenMessages.length > 0) {
      setMessages((prev) => {
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
      console.log("emit           Message:StopTyping");
      ws.emit("Message:StopTyping", JSON.stringify({ chatId: chat?._id }));
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
    ws.emit("Message:Seen", JSON.stringify({ chatId: chat?._id }));
    ws.emit("Message:Delivered", JSON.stringify({ chatId: chat?._id }));
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
      setMessages([]);
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
                {isGreet ? "Greet Msg" : ""}
                {isTabActive ? " You see the chat" : "You left the chat"}
              </p>
              <p className="text-sm text-muted-foreground">Date</p>
            </div>
          </div>
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
                    <p
                      data-seen={message.seen}
                      data-delivered={message.delivered}
                      className="flex flex-col justify-center items-end gap-1"
                    >
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
                        ) : message.delivered ? (
                          <CheckCheck className="h-4 w-4" color={"gray"} />
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
    </div>
  );
}
