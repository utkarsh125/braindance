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
import { zodResolver } from "@hookform/resolvers/zod"

//common types 
import { CreateUserSchema, SignInSchema } from "@repo/common/types";
import { useForm } from "react-hook-form"

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

  const form = useForm({
    resolver: zodResolver(isLogin ? SignInSchema : CreateUserSchema),
    defaultValues: isLogin ? {
      username: '',
      password: '',
    } : {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  })

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
  
    try {
      if (isLogin) {
        const response = await API.post("signin", { username: data.username, password: data.password });
        const responseData = response.data;
        sessionStorage.setItem("token", responseData.token);
        sessionStorage.setItem("userId", responseData.userId);
        router.push("/dashboard");
      } else {
        const response = await API.post("signup", { username: data.username, email: data.email, password: data.password });
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {!isLogin && (
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    {...form.register("email")} 
                    type="email" 
                    placeholder="m@example.com" 
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  {...form.register("username")} 
                  type="text" 
                  placeholder="johndoe" 
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  {...form.register("password")} 
                  type="password" 
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
        
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Loading...' : (isLogin ? "Login" : "Sign Up")}
              </Button>
            </div>
          </form>
          
          <div className="text-center text-sm mt-4">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}