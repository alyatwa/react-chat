import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatDisplay from "./components/chatDisplay";
import ChatList from "./components/chatList";
//import { useState } from "react";
import { useGetChats, useGetGroups } from "@/routes/chat/hooks/queries";
import { useChats } from "@/context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import Header from "./components/header";
import { isLoggedIn } from "@/reactQuery";
import { CircleOff } from "lucide-react";
import GroupList from "./components/GroupList";

export default function ChatP() {
  const { chat, chats, setChats, filter, setFilter, group, groups, setGroups } =
    useChats();
  const { data: groupsData, refetch: refetchGroups } = useGetGroups();
  const { data, isLoading, refetch } = useGetChats(filter);
  useEffect(() => {
    refetch();
    setChats(data ?? []);
  }, [filter, refetch]);

  /**************************** refetch groups ****************************** */
  useEffect(() => {
    refetchGroups();
    setGroups(groupsData ?? []);
  }, [refetchGroups]);

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
    if (value == "group") {
      refetchGroups();
    } else if (value == "archived") {
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

  const tabs = [
    {
      label: "All chats",
      value: "all",
    },
    {
      label: "Group",
      value: "group",
    },
    {
      label: "Archive",
      value: "archived",
    },
    {
      label: "Unread",
      value: "unread",
    },
    {
      label: "Locked",
      value: "locked",
    },
    {
      label: "Anonymous",
      value: "anonymous",
    },
  ];
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
          <ResizablePanel defaultSize={[265, 440, 655][0]} minSize={30}>
            <Tabs defaultValue="all" onValueChange={handleTabChange}>
              <div className="flex items-center px-2 py-2">
                <TabsList className="ml-auto">
                  {tabs.map((tab, index) => {
                    return (
                      <TabsTrigger
                        key={index}
                        value={tab.value}
                        className="text-zinc-600 dark:text-zinc-200"
                      >
                        {tab.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              <Separator className="mb-2" />

              {tabs.map((tab, index) => {
                return (
                  <TabsContent key={index} value={tab.value} className="m-0">
                    {isLoading || !chats || chats.length == 0 ? (
                      <div className=" w-full h-full flex flex-row items-center justify-center">
                        <CircleOff color="white" className="w-10 h-10" />
                      </div>
                    ) : tab.value != "group" ? (
                      <ChatList />
                    ) : (groupsData ?? []).length > 0 ? (
                      <GroupList groups={groupsData ?? []} />
                    ) : (
                      <div className=" w-full h-full flex flex-row items-center justify-center">
                        <CircleOff color="white" className="w-10 h-10" />
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          </ResizablePanel>

          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={[265, 440, 655][2]}>
            {((chats && chat) || (groups && group)) && <ChatDisplay />}
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
}
