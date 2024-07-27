import { createContext, ReactNode, useContext } from "react";

import { User } from "@/routes/chat/data";
import { useGetUser } from "@/routes/chat/hooks/queries";

type TUserContext = {
  data?: User | null;
  isLoading: boolean;
};

const UserContext = createContext<TUserContext | null>(null);

type Props = {
  children: ReactNode;
};

export const UserProvider = ({ children }: Props): JSX.Element => {
  const { data, isLoading } = useGetUser();
  // const [user, setUser] = useState<User | null>(null);
  const value = {
    data,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser has to be used within <UserContext.Provider>");
  }

  return ctx;
};
