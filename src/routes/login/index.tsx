import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { isLoggedIn } from "@/reactQuery";
import { useLogin } from "./hooks/queries.tsx";

export default function Login() {
  const { mutateAsync: doLogin } = useLogin();
  const [email, setEmail] = useState("reyouapp@gmail.com");
  const [password, setPassword] = useState("123456789");
  useEffect(() => {
    const handleRedirects = async () => {
      try {
        //redirect to chat page
        window.location.href = "/chat";
      } catch (error) {
        console.log("Error - Not logged in yet");
      }
    };
    if (isLoggedIn()) {
      handleRedirects();
    }
  }, []);

  const login = async () => {
    console.log("login");
    await doLogin({
      email,
      password,
      fcmToken: "dffgt",
    }).then(() => {
      window.location.href = "/chat";
    });
  };
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={login} className="w-full">
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
