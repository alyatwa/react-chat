import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChats } from "@/context";
import { isLoggedIn, logout } from "@/reactQuery";
import { Check, Plus } from "lucide-react";
import { ws } from "@/ws";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { toast } from "sonner";
import { useGetFriends, useGetUser, useStartChat } from "../hooks/queries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { SuggestedFriend } from "../hooks/type";
import { services } from "@/const";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SuggestedFriend[]>([]);
  const { data: friends, refetch } = useGetFriends();
  const { chat, setGreetUser } = useChats();
  const { data } = useGetUser();
  const { mutateAsync: startChat } = useStartChat();

  const handleStartChat = async (userId: string) => {
    setOpen(false);
    setGreetUser(userId);
    await startChat({
      userId,
      categoryId: services.greetChatId,
    });
  };
  const leaveChat = () => {
    if (!chat) {
      ws.emit("leaveRoom", chat, (err: any) => {
        if (err) {
          console.log(err); // display error if any
        } else {
          toast(`Left room: ${chat}`);
        }
      });
    } else {
      toast("chat not found");
    }
  };
  const leaveAllChats = () => {
    ws.emit("leaveAllRooms", (err: any) => {
      if (err) {
        console.log(err); // display error if any
      } else {
        toast("Left all rooms");
      }
    });
  };
  return (
    <>
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col justify-around gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 w-full">
          <div className="">
            {!isLoggedIn() && (
              <Button
                variant="link"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Login
              </Button>
            )}
            {isLoggedIn() && (
              <>
                <Button
                  onClick={() => {
                    ws.emit("disconnectMe");
                    logout();
                  }}
                  variant="link"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Logout
                </Button>
                <Button
                  onClick={leaveAllChats}
                  variant="link"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  leave all rooms
                </Button>

                <Button
                  onClick={leaveChat}
                  variant="link"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  leave current rooms
                </Button>
              </>
            )}
          </div>
          {data && (
            <div className="flex flex-row justify-center items-center space-x-4">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      className="ml-auto rounded-full"
                      onClick={() => {
                        refetch();
                        setOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">New message</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={10}>New message</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Avatar>
                <AvatarImage src={data.profilePicture} alt="profile picture" />
                <AvatarFallback>OM</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{`${data.firstName} ${data.lastName}`}</p>
                <p className="text-sm text-muted-foreground">{data.userId}</p>
              </div>
            </div>
          )}
        </nav>
      </header>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-4 pb-4 pt-5">
            <DialogTitle>Start Greet chat</DialogTitle>
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
                {(friends ?? []).map((user) => (
                  <CommandItem
                    key={user._id}
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
                        [...(friends ?? [])].filter((u) =>
                          [...selectedUsers, user].includes(u)
                        )
                      );
                    }}
                  >
                    <Avatar>
                      <AvatarImage src={user.profilePicture} alt="Image" />
                      <AvatarFallback>{user.firstName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-sm font-medium leading-none">
                        {`${user.firstName} ${user.lastName}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user._id}
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
                    key={user._id}
                    className="inline-block border-2 border-background"
                  >
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>{user.firstName[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select users to add to this thread.
              </p>
            )}
            <Button
              disabled={selectedUsers.length < 1}
              onClick={() => handleStartChat(selectedUsers[0]._id)}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;
