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

interface LoginFormProps extends React.ComponentProps<"div"> {
  mode?: "login" | "signup"
}

export function LoginForm({
  className,
  mode = "login",
  ...props
}: LoginFormProps) {
  const isLogin = mode === "login"
  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {isLogin ? "Login to your account" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Enter your email below to login to your account"
              : "Enter your details below to create your account"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              {!isLogin && (
                <div className="grid gap-3">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  )}
                </div>
                <Input id="password" type="password" required />
              </div>
              {!isLogin && (
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" required />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  {isLogin ? "Login" : "Sign Up"}
                </Button>
                {/* <Button variant="outline" className="w-full">
                  {isLogin ? "Login with Github" : "Sign up with Github"}
                </Button> */}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}