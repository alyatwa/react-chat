import { MutationCache, QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ZodIssue } from "zod";
import { toast } from "sonner";

export enum ApiErrorTypes {
  ValidationError = "ValidationFailure",
  BadRequestError = "BadRequest",
  UnauthorizedError = "UnauthorizedError",
  ForbiddenError = "PermissionDenied",
}

export type TApiErrors =
  | {
      error: ApiErrorTypes.ValidationError;
      message: ZodIssue[];
      statusCode: 403;
    }
  | { error: ApiErrorTypes.ForbiddenError; message: string; statusCode: 401 }
  | {
      statusCode: 400;
      message: string;
      error: ApiErrorTypes.BadRequestError;
    };

// this is saved in react-query cache
export const AUTH_TOKEN_CACHE_KEY = ["auth-token"];

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        const serverResponse = error.response?.data as TApiErrors;
        if (serverResponse?.error === ApiErrorTypes.ValidationError) {
          toast("Validation Error", {
            description: (
              <div>
                {serverResponse.message?.map(({ message, path }) => (
                  <div className="flex space-y-2" key={path.join(".")}>
                    <div>
                      Field <i>{path.join(".")}</i> {message.toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>
            ),
          });
          return;
        }
        if (serverResponse.statusCode === 401) {
          toast("Forbidden Access", {
            description: error.message,
          });
          return;
        }
        toast("Bad Request", {
          description: error.response?.data.error.message,
        });
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// memory token storage will be moved to apiRequest module until securityclient is completely depreciated
// then all the getters will be also hidden scoped to apiRequest only
const MemoryTokenStorage = () => {
  let authToken: string = localStorage.getItem("token") || "";

  return {
    setToken: (token: string) => {
      localStorage.setItem("token", token);
      authToken = token;
    },
    getToken: () => authToken,
  };
};
const authTokenStorage = MemoryTokenStorage();

export const setAuthToken = authTokenStorage.setToken;

export const getAuthToken = authTokenStorage.getToken;

export const isLoggedIn = () => Boolean(getAuthToken());

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
