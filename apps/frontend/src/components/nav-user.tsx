"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export function NavUser() {
  const { isAuthenticated, token, logout } = useAuth();
  const { isMobile } = useSidebar();
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    avatar: string;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      console.log(
        "NavUser: isAuthenticated:",
        isAuthenticated,
        "token:",
        token
      );

      if (isAuthenticated && token) {
        try {
          console.log("NavUser: Fetching user info...");
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("NavUser: Response status:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("NavUser: User data received:", data);
            console.log("NavUser: User username:", data.username);
            console.log("NavUser: User email:", data.user.email);

            setUserInfo({
              name: data.user.username,
              email: data.user.email,
              avatar: data.user.photo || "/avatar/avatar.png",
            });
          } else {
            console.error(
              "NavUser: Response not ok:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error("NavUser: Error fetching user info:", error);
        }
      } else {
        console.log("NavUser: Not authenticated or no token");
      }
    };

    fetchUserInfo();
  }, [isAuthenticated, token]);
  if (!userInfo) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse mt-1" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }
  ``;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                <AvatarFallback className="rounded-lg">
                  {/* {userInfo.name.charAt(0).toUpperCase()}
                   */}
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userInfo.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {userInfo.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                  <AvatarFallback className="rounded-lg">
                    {userInfo.name
                      ? userInfo.name.charAt(0).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userInfo.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userInfo.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
