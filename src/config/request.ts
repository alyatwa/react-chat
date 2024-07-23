import axios from "axios";
import { getAuthToken } from "@/reactQuery";

export const apiRequest = axios.create({
  baseURL: "https://49dev.com",
  headers: {
    "Content-Type": "application/json",
  },
});

apiRequest.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (config.headers) {
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});
