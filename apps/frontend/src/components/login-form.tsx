"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { API } from "@/lib/api"

interface LoginFormProps extends React.ComponentProps<"div"> {
  mode?: "login" | "signup"
}

export function LoginForm({
  className,
  mode = "login",
  ...props
}: LoginFormProps) {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isLogin = mode === "login"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isLogin) {
        const response = await API.post("signin", { username, password });
        const data = response.data;
        sessionStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        const response = await API.post("signup", { username, email, password });
        router.push('/login?message=Account created!');
      }
    } catch (error: any) {
      console.log("Error: ", error);
      setError(error.response?.data?.message || 'An error occurred, please try again later');
    } finally {
      setIsLoading(false);
    }
  }  

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isLogin ? "Login to your account" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Enter your username and password to login"
              : "Enter your details below to create your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {!isLogin && (
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" type="text" placeholder="johndoe" required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {!isLogin && (
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" required />
                </div>
              )}
              
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : (isLogin ? "Login" : "Sign Up")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}