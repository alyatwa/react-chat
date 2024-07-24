import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/config/request";
import { setAuthToken } from "@/reactQuery";

export const login = async (loginDetails: {
  email: string;
  password: string;
  fcmToken: string;
}) => {
  const { data } = await apiRequest.post<{ data: { accessToken: string } }>(
    "/api/v1/auth/login",
    loginDetails
  );
  return data.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (details: {
      email: string;
      password: string;
      fcmToken: string;
    }) => {
      return login(details);
    },
    onSuccess: (data) => {
      setAuthToken(data.accessToken);
    },
  });
};
