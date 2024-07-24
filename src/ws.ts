import socketIOClient from "socket.io-client";

export const WS = "https://49dev.com"; // "http://localhost:3000";

export const ws = socketIOClient(WS, {
  extraHeaders: {
    authorization: `${localStorage.getItem("token")}`,
  },
});
