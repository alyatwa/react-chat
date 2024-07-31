import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatDisplay from "./components/chatDisplay";
import ChatList from "./components/chatList";
//import { useState } from "react";
import { useGetChats } from "@/routes/chat/hooks/queries";
import { useChats } from "@/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import Header from "./components/header";
import { isLoggedIn } from "@/reactQuery";
import { CircleOff } from "lucide-react";

export default function ChatP() {
  const { chat, chats, setChats, filter, setFilter } = useChats();

  const { data, isLoading, refetch } = useGetChats(filter);
  useEffect(() => {
    refetch();
    setChats(data ?? []);
  }, [filter, refetch]);

  useEffect(() => {
    setChats(data ?? []);
  }, [data]);
  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
    } else {
      refetch();
    }
  }, []);
  const handleTabChange = (value: string) => {
    //setArchived(value == "archived");
    let data: any = {};
    if (value == "archived") {
      data = {
        privacy: "normal",
        categoryId: "668e7dc4e8cfec5bcc752afc",
        archived: true,
      };
    } else if (value == "locked") {
      data = {
        privacy: "normal",
        categoryId: "668e7dc4e8cfec5bcc752afc",
        isLocked: true,
        password: "123",
      };
    } else if (value == "unread") {
      data = {
        privacy: "normal",
        categoryId: "668e7dc4e8cfec5bcc752afc",
        isUnread: true,
      };
    } else if (value == "anonymous") {
      data = {
        privacy: "anonymous",
        categoryId: "668e7e2ce8cfec5bcc752afd",
        isUnread: false,
      };
    } else if (value == "all") {
      data = {
        privacy: "normal",
        categoryId: "668e7dc4e8cfec5bcc752afc",
        archived: false,
      };
    }

    setFilter(data);
    refetch();
  };

  return (
    <div className="flex flex-col w-full">
      <Header />
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout=${JSON.stringify(
              sizes
            )}`;
          }}
          className="h-full max-h-[800px] items-stretch"
        >
          <ResizablePanel defaultSize={[265, 440, 655][1]} minSize={30}>
            <Tabs defaultValue="all" onValueChange={handleTabChange}>
              <div className="flex items-center px-4 py-2">
                <h1 className="text-xl font-bold">Chats</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger
                    value="all"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    All chats
                  </TabsTrigger>
                  <TabsTrigger
                    value="archived"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Archive
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Unread
                  </TabsTrigger>
                  <TabsTrigger
                    value="locked"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Locked
                  </TabsTrigger>
                  <TabsTrigger
                    value="anonymous"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Anonymous
                  </TabsTrigger>
                </TabsList>
              </div>
              <Separator className="mb-2" />

              <TabsContent value="all" className="m-0">
                {isLoading || !chats || chats.length == 0 ? (
                  <div className=" w-full h-full flex flex-row items-center justify-center">
                    <CircleOff color="white" className="w-10 h-10" />
                  </div>
                ) : (
                  <ChatList />
                )}
              </TabsContent>
              <TabsContent value="archived" className="m-0">
                {isLoading || !chats || chats.length == 0 ? (
                  <div className=" w-full h-full flex flex-row items-center justify-center">
                    <CircleOff color="white" className="w-10 h-10" />
                  </div>
                ) : (
                  <ChatList />
                )}
              </TabsContent>
              <TabsContent value="unread" className="m-0">
                {isLoading || !chats || chats.length == 0 ? (
                  <div className=" w-full h-full flex flex-row items-center justify-center">
                    <CircleOff color="white" className="w-10 h-10" />
                  </div>
                ) : (
                  <ChatList />
                )}
              </TabsContent>
              <TabsContent value="locked" className="m-0">
                {isLoading || !chats || chats.length == 0 ? (
                  <div className=" w-full h-full flex flex-row items-center justify-center">
                    <CircleOff color="white" className="w-10 h-10" />
                  </div>
                ) : (
                  <ChatList />
                )}
              </TabsContent>

              <TabsContent value="anonymous" className="m-0">
                {isLoading || !chats || chats.length == 0 ? (
                  <div className=" w-full h-full flex flex-row items-center justify-center">
                    <CircleOff color="white" className="w-10 h-10" />
                  </div>
                ) : (
                  <ChatList />
                )}
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={[265, 440, 655][2]}>
            {chats && chat && <ChatDisplay />}
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
}
