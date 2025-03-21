
import React, { useState } from "react";
import { LayoutDashboard, Hash, Settings, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Import refactored sidebar components
import { Sidebar } from "@/components/sidebar/SidebarComponents";
import { SidebarBody } from "@/components/sidebar/SidebarComponents";
import { SidebarLink } from "@/components/sidebar/SidebarLink";
import { Logo, LogoIcon } from "@/components/sidebar/SidebarLogo";

// The main dashboard sidebar component
export const DashboardSidebar = () => {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Hashtags",
      href: "/hashtags",
      icon: (
        <Hash className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Brand Voice",
      href: "/brand-voice",
      icon: (
        <FileText className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  // Add logout option with a click handler instead of a route
  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
            <div 
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer"
            >
              <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
                  {
                    "opacity-0 hidden": !open,
                    "opacity-100": open,
                  }
                )}
              >
                Logout
              </span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-start gap-2 py-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              {profile?.avatar_url ? (
                <AvatarImage 
                  src={profile.avatar_url} 
                  alt={user?.email || 'User'} 
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="bg-gray-300 text-gray-700">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <span
              className={cn(
                "text-neutral-700 dark:text-neutral-200 text-sm transition duration-150 whitespace-pre inline-block !p-0 !m-0",
                {
                  "opacity-0 hidden": !open,
                  "opacity-100": open,
                }
              )}
            >
              {user?.email}
            </span>
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
};
