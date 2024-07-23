import React from "react";
import ReactDOM from "react-dom/client";
//import App from "./App.tsx";
import "@/styles/globals.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoomProvider } from "./context/RoomContext.tsx";
import ErrorPage from "./error-page.tsx";
import Chat from "./routes/chat/chat.tsx";
import Home from "./routes/home.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { ChatProvider } from "./context/ChatContext.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./reactQuery.tsx";
import Login from "./routes/login/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: "chat/",
    element: <Chat />,
  },
  {
    path: "login",
    element: <Login />,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="h-full overflow-y-hidden">
      <QueryClientProvider client={queryClient}>
        <RoomProvider>
          <ChatProvider>
            <RouterProvider router={router} />
          </ChatProvider>
        </RoomProvider>
      </QueryClientProvider>
      <Toaster />
    </div>
  </React.StrictMode>
);
