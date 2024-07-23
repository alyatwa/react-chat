import { useContext, useEffect, useRef, useState } from "react";
import Peer, { MediaConnection } from "peerjs";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./components/ui/use-toast";
import { RoomContext } from "./context/RoomContext";

const roomId = "123";
function App() {
  const [myId, setMyId] = useState<string | null>("");
  const [peerId, setPeerId] = useState<string>("112233");
  const { toast } = useToast();
  const [currentCall, setCurrentCall] = useState<
    MediaConnection | null | undefined
  >(null);
  const peerConnection = useRef<RTCPeerConnection>();
  const [incomingCall, setIncomingCall] = useState<MediaConnection | null>(
    null
  );

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const localStream = useRef<MediaStream | null>(null);
  const peerInstance = useRef<Peer>();

  const { ws } = useContext(RoomContext);

  useEffect(() => {
    const peer = new Peer({
      config: {
        host: "http://localhost", //"https://49dev.com",
        port: 3000,
        path: "/peerjs",
        /* iceServers: [
          {
            url: "stun:stun.l.google.com:19302",
          },
        ], */
      } /* Sample servers, please use appropriate ones */,
    });

    peerInstance.current = peer;
    peerInstance.current.on("open", (id) => {
      setMyId(id ?? "-");
      ws.emit("join-room", { roomId, peerId: id });
    });
    peerInstance.current.on("call", (call) => {
      setIncomingCall(call);
      answerCall();
      toast({
        title: "Incoming call",
      });
    });
    peerInstance.current.on("error", (err) => {
      console.error(err);
    });

    handleSocket();

    return () => {
      peer.destroy();
    };
  }, []);

  /*  useEffect(() => {
    me?.on("open", () => {
      ws.emit("join-room", { roomId, peerId: me._id });
    });
  }, [roomId, me, ws]); */

  const LoginA = () => {
    localStorage.setItem(
      "token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb2NrZXRJZCI6ImJhNWY3NzQ5LTU3ZDktNDhkMy1hZTNhLWI1YTk0MWYyM2NkMyIsImlhdCI6MTcyMTA3Njc3NSwiZXhwIjo1NTcyMTA3Njc3NSwic3ViIjoiNjY2YTQyZDNlYzQ0YjIxYjk4ZWVkMWNmIn0.Zd18M9kh_XtLfF055JJYd652boPoZLYi-tg11ZjekAc"
    );
  };
  const LoginB = () => {
    localStorage.setItem(
      "token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzb2NrZXRJZCI6ImRmMzA3MWE0LWFhNTgtNGI2MS1hYzg0LTM1YjMxZDhhMjEyMSIsImlhdCI6MTcyMTA3Njg4MSwiZXhwIjo1NTcyMTA3Njg4MSwic3ViIjoiNjY5MjViYjI0OTc5MzE4MTk5ZjNlOGRjIn0.W48EK4j8GuFv23n0o1uKyvCvt-MtAZlg3of_Jra0q7k"
    );
  };
  const answerCall = async () => {
    if (incomingCall) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStream.current = stream;
      if (localVideo.current) {
        localVideo.current.srcObject = stream;
      }

      incomingCall.answer(stream);
      incomingCall.on("stream", (remoteStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      });
      setCurrentCall(incomingCall);
    }
  };

  const callUser = async () => {
    console.log("calling user", peerId);
    //createPeerConnection();

    if (currentCall) {
      currentCall.close();
      setCurrentCall(null);
      return;
    }
    ws.emit("Call:Start", { peerId, roomId });
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localStream.current = stream;
    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }
    const call = peerInstance.current?.call(peerId, stream);
    call?.on("stream", (remoteStream) => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    });
  };

  const endCall = () => {
    const call = peerInstance.current?.call(peerId, localStream.current!);
    call?.close();
    localStream.current = null;
    remoteVideo.current!.srcObject = null;
    localVideo.current!.srcObject = null;
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (incomingCall) {
      incomingCall.close();
      setIncomingCall(null);
    }
  };

  const handleSocket = () => {
    console.log("handleSocket");
    ws.on("connect", () => {
      console.log("WebSocket connected");
    });
    ws.on("connect_error", (error) => {
      console.error("WebSocket connection error", error);
    });

    ws.on("disconnect", (reason) => {
      console.log("WebSocket disconnected", reason);
    });
    ws.on("Call:Start", async (data) => {
      console.log("Call:Start ", data);
      const call = peerInstance.current?.call(
        data.socket,
        localStream.current!
      );
      call?.on("stream", (remoteStream) => {
        if (remoteVideo.current) {
          remoteVideo.current.srcObject = remoteStream;
        }
      });
      setCurrentCall(call);
    });

    ws.on("Call:Answer", async (data) => {
      console.log("Call:Answer ", data);
      /* const call = peerInstance.current?.calls.find(
        (c) => c.peer === data.socket
      ); */
      const call = peerInstance.current?.call(
        data.socket,
        localStream.current!
      );
      if (call) {
        call.answer(data.answer);
      }
    });

    ws.on("Call:Decline", () => {
      if (currentCall) {
        currentCall.close();
        setCurrentCall(null);
      }
    });

    ws.on("Call:End", () => {
      if (currentCall) {
        currentCall.close();
        setCurrentCall(null);
      }
    });
  };

  // Create PeerConnection function
  const createPeerConnection = () => {
    // Initialize PeerConnection
    peerConnection.current = new RTCPeerConnection();

    // On ICE candidate event
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(
          `Sending ICE candidate to remote peer: ${JSON.stringify(event.candidate)}`
        );
        const channel = peerConnection.current!.createDataChannel("channel");
        channel.onopen = function (e) {
          if (channel.readyState === "open") {
            channel.send(JSON.stringify({ ice: event.candidate }));
          }
        };
      }
    };
  };

  /*  
    const remotePeerId = peerId;
    // Create PeerConnection
    createPeerConnection();

    // Get local media stream and attach to local video element
    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then((stream) => {
        // Attach stream to local video element
        localVideo.current!.srcObject = stream;
        localStream = stream;

        // Add local stream to PeerConnection
        localStream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, localStream);
        });

        // Create and send offer to remote peer
        return peerInstance.current?.call(remotePeerId, localStream);
      })
      .then(() => {
        console.log("Call sent successfully!");
      })
      .catch((error) => {
        console.log(`getUserMedia() error: ${error}`);
      });
  };

  const answerUser = async () => {
    // Answer incoming call
    peerInstance.current?.on("call", (incomingCall) => {
      // Create PeerConnection
      createPeerConnection();

      // Answer incoming call with local media stream
      navigator.mediaDevices
        .getUserMedia(mediaConstraints)
        .then((stream) => {
          // Attach stream to local video element
          if (localVideo.current) localVideo.current.srcObject = stream;
          localStream = stream;

          // Add local stream to PeerConnection
          localStream.getTracks().forEach((track) => {
            peerConnection.current?.addTrack(track, localStream);
          });

          // Answer incoming call with local stream
          incomingCall.answer(localStream);

          // Set remote video element source to incoming stream
          incomingCall.on("stream", (incomingStream) => {
            if (remoteVideo.current) {
              remoteVideo.current.srcObject = incomingStream;
            }
          });
        })
        .catch((error) => {
          console.log(`getUserMedia() error: ${error}`);
        });
    });
  };

  // Create PeerConnection function
  const createPeerConnection = () => {
    // Initialize PeerConnection
    peerConnection.current = new RTCPeerConnection();

    // On ICE candidate event
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(
          `Sending ICE candidate to remote peer: ${JSON.stringify(event.candidate)}`
        );
        peerConnection.current?.send(JSON.stringify({ ice: event.candidate }));
      }
    };

    // On track event
    peerConnection.current.ontrack = (event) => {
      console.log("Remote stream received!");
      if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0];
    };
  }; */

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-y-4 text-white font-normal">
        <div className="flex flex-row gap-4">
          <Button onClick={LoginA}>Login A</Button>
          <Button onClick={LoginB}>Login B</Button>
        </div>

        <div className="w-full my-2">My id : {myId}</div>

        <div className="flex flex-row gap-4">
          <video
            ref={localVideo}
            autoPlay
            muted
            className="w-1/2 h-1/2 bg-gray-200"
          />
          <video
            ref={remoteVideo}
            autoPlay
            className="w-1/2 h-1/2 bg-gray-200"
          />
        </div>
        <input
          type="text"
          placeholder="112233"
          value={peerId}
          onChange={(e) => setPeerId(e.target.value)}
          className="p-2 border border-gray-300 rounded text-black"
        />

        <div className="flex flex-row gap-4">
          <Button onClick={callUser}>start call</Button>
          <Button onClick={declineCall}>Decline call</Button>

          <Button onClick={answerCall}>Answer</Button>
          <Button onClick={endCall}>End Call</Button>
        </div>
      </div>
      <Toaster />
    </main>
  );
}

export default App;
