import { createContext, useEffect, useState } from "react";
import Peer from "peerjs";
//import { v4 as uuidV4 } from "uuid";
import { ws } from "../ws";
import { Socket } from "socket.io-client";
import { useChats } from "./ChatContext";

export const RoomContext = createContext<{
  ws: Socket;
}>({
  ws: ws,
});

//const ws = socketIOClient(WS);

export const RoomProvider: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  //const { messages, setMessages } = useChats();
  const [me, setMe] = useState<Peer>();
  ///const [peers, dispatch] = useReducer(peersReducer, {});
  const [stream, setStream] = useState<MediaStream>();

  const handleUserList = ({ participants }: { participants: string[] }) => {
    participants.map((peerId) => {
      const call = stream && me?.call(peerId, stream);
      console.log("call", call);
      call?.on("stream", (userVideoStream: MediaStream) => {
        //console.log({ addPeerAction });
        // dispatch(addPeerAction(peerId, userVideoStream));
      });
    });
  };

  useEffect(() => {
    const meId = "2425252"; //uuidV4();
    /*   const peer = new Peer(meId);
    setMe(peer);
    try {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setStream(stream);
        });
    } catch (err) {
      console.error({ err });
    } */
    //ws.on("room-created", enterRoom);
    ws.on("get-users", handleUserList);
    //ws.on("user-disconnected", removePeer);
  }, []);

  useEffect(() => {
    if (!stream) return;
    if (!me) return;

    /*     ws.on("user-joined", ({ peerId }: { roomId: string; peerId: string }) => {
      const call = stream && me.call(peerId, stream);
      call.on("stream", (userVideoStream: MediaStream) => {
        //dispatch(addPeerAction(peerId, userVideoStream));
      });
    });

    me.on("call", (call) => {
      call.answer(stream);
      call.on("stream", (userVideoStream) => {
        //dispatch(addPeerAction(call.peer, userVideoStream));
      });
    }); */
  }, [me]);

  return <RoomContext.Provider value={{ ws }}>{children}</RoomContext.Provider>;
};
