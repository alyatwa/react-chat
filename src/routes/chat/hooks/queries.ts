import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/config/request";
import { Chat, User } from "../data";
import { MessageProp } from "./type";

export const chatQueryKeys = {
  getChats: () => ["chats"] as const,
  getChat: () => ["chat"] as const,
};

const fetchChats = async (query: any) => {
  const { data } = await apiRequest.post<{ data: Chat[] }>(
    "/api/v1/chat/get-chats",
    query
  );
  return data.data || [];
};

export const useGetChats = (query: any) =>
  useQuery({
    queryKey: chatQueryKeys.getChats(),
    queryFn: () => fetchChats(query),
  });

const fetchUser = async () => {
  const { data } = await apiRequest.get<{ data: User }>(
    "/api/v1/users/profile"
  );
  return data.data;
};
export const useGetUser = () =>
  useQuery({
    queryKey: ["get-user"],
    queryFn: () => fetchUser(),
  });

const fetchChat = async (chatId: string | null) => {
  console.log("fetchChat", chatId);
  if (!chatId) return null;

  const { data } = await apiRequest.get<{ data: MessageProp }>(
    `/api/v1/chat/get-chat/${chatId}`
  );
  console.log(data.data);
  return data.data.messages;
};
export const useGetChat = (chatId: string | null) =>
  useQuery({
    queryKey: chatQueryKeys.getChat(),
    queryFn: () => fetchChat(chatId),
  });
