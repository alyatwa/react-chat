import { useMutation, useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/config/request";
import { Chat, User } from "../data";
import { Group, GroupProps, MessageProp, SuggestedFriend } from "./type";

export const chatQueryKeys = {
  getChats: () => ["chats"] as const,
  getChat: () => ["chat"] as const,
  getGroups: () => ["groups"] as const,
  getGroup: () => ["group"] as const,
};

export const userQueryKeys = {
  getFriends: () => ["friends"] as const,
};

export const userMutationKeys = {
  sendFriendRequest: () => ["friend-request"] as const,
};

export const chatMutationKeys = {
  sendGreet: () => ["greet"] as const,
  startChat: () => ["start-chat"] as const,
};
/************************* Send friend request *************************** */
const sendFriendRequest = async ({ userId }: { userId: string }) => {
  const { data } = await apiRequest.post<{ data: any }>(
    `/api/v1/friends/sendFriendRequest/${userId}`
  );
  return data.data;
};
export const useSendFriendRequest = () =>
  useMutation({
    mutationKey: userMutationKeys.sendFriendRequest(),
    mutationFn: sendFriendRequest,
  });

/*********************** Get suggested friends *************************** */
const fetchFriends = async () => {
  const { data } = await apiRequest.get<{ data: SuggestedFriend[] }>(
    "/api/v1/users/suggest?limit=10&page=1"
  );
  return data.data || [];
};

export const useGetFriends = () =>
  useQuery({
    queryKey: userQueryKeys.getFriends(),
    queryFn: () => fetchFriends(),
  });

/************************** Start greet ************************************* */
const startChat = async ({
  userId,
  categoryId,
}: {
  userId: string;
  categoryId: string;
}) => {
  const { data } = await apiRequest.post<{ data: any }>(
    `/api/v1/chat/start-chat/${userId}?categoryId=${categoryId}`
  );
  return data.data;
};
export const useStartChat = () =>
  useMutation({
    mutationKey: chatMutationKeys.startChat(),
    mutationFn: startChat,
  });

/************************* Send greet msg  *********************** */
const sendGreet = async ({
  userId,
  message,
}: {
  userId: string;
  message: string;
}) => {
  const { data } = await apiRequest.post<{ data: any }>(
    `/api/v1/users/greet/${userId}`,
    JSON.stringify({ message })
  );
  return data.data;
};
export const useSendGreet = () =>
  useMutation({
    mutationKey: chatMutationKeys.sendGreet(),
    mutationFn: sendGreet,
  });

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
  const { data } = await apiRequest.post<{ data: { chats: Chat[] } }>(
    "/api/v1/chat/get-chats",
    query
  );
  return data.data.chats || [];
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
