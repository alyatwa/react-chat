import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useChats } from "@/context";
import { isLoggedIn, logout } from "@/reactQuery";
import { ws } from "@/ws";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { toast } from "sonner";
import { useGetUser } from "../hooks/queries";

const Header = () => {
  const { chat } = useChats();
  const { data } = useGetUser();

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
                  ws.emit("disconnect");
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
  );
};

export default Header;
