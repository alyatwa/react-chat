import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatDisplay from "./components/chatDisplay";
import ChatList from "./components/chatList";
import { Loader } from "@/components/Loader";
//import { useState } from "react";
import { useGetChats } from "@/routes/chat/hooks/queries";
import { useChats } from "@/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";

export default function Chat() {
  const { chat } = useChats();
  const [archived, setArchived] = useState(false);
  const {
    data: chats,
    isLoading,
    refetch,
  } = useGetChats({
    privacy: "normal",
    categoryId: "668e7dc4e8cfec5bcc752afc",
    archived,
  });

  useEffect(() => {
    refetch();
  }, [archived, refetch]);

  const handleTabChange = (value: string) => {
    setArchived(value == "archived");
  };

  return (
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
              </TabsList>
            </div>
            <Separator className="mb-2" />

            <TabsContent value="all" className="m-0">
              {isLoading || !chats ? <Loader /> : <ChatList items={chats} />}
            </TabsContent>
            <TabsContent value="archived" className="m-0">
              {isLoading || !chats ? <Loader /> : <ChatList items={chats} />}
            </TabsContent>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={[265, 440, 655][2]}>
          {chats && chat && <ChatDisplay />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
