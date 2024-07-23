import socketIOClient from "socket.io-client";

export const WS = "http://localhost:3000"; // "https://49dev.com";

export const ws = socketIOClient(WS, {
  extraHeaders: {
    authorization: `${localStorage.getItem("token")}`,
  },
});
