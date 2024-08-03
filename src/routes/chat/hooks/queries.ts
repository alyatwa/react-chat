import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/config/request";
import { Chat, User } from "../data";
import { Group, GroupProps, MessageProp } from "./type";

export const chatQueryKeys = {
  getChats: () => ["chats"] as const,
  getChat: () => ["chat"] as const,
  getGroups: () => ["groups"] as const,
  getGroup: () => ["group"] as const,
};

/***************************** Get groups ************************ */
const fetchGroups = async () => {
  const { data } = await apiRequest.get<{ data: Group[] }>(
    "/api/v1/chat/group/get-groups"
  );
  return data.data || [];
};

export const useGetGroups = () =>
  useQuery({
    queryKey: chatQueryKeys.getGroups(),
    queryFn: () => fetchGroups(),
  });

/****************** Group chat******************* */
const fetchGroup = async (groupId: string | null) => {
  if (!groupId) return null;

  const { data } = await apiRequest.get<{ data: GroupProps }>(
    `/api/v1/chat/group/get-messages/${groupId}`
  );
  return data.data.messages;
};

export const useGetGroup = (groupId: string | null) =>
  useQuery({
    queryKey: chatQueryKeys.getGroup(),
    queryFn: () => fetchGroup(groupId),
  });

/************************ Get chat ****************************** */
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

/******************** Get user ******************** */
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
/****************** Normal chat******************* */
const fetchChat = async (chatId: string | null) => {
  if (!chatId) return null;

  const { data } = await apiRequest.get<{ data: MessageProp }>(
    `/api/v1/chat/get-chat/${chatId}`
  );
  return data.data.messages;
};
export const useGetChat = (chatId: string | null) =>
  useQuery({
    queryKey: chatQueryKeys.getChat(),
    queryFn: () => fetchChat(chatId),
  });
