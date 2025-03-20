
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

export const SidebarLink = ({
  link,
  className,
}: {
  link: {
    label: string;
    href: string;
    icon: React.ReactNode;
  };
  className?: string;
}) => {
  const { open } = useSidebar();
  const location = useLocation();
  const isActive = location.pathname === link.href;
  
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-2",
        isActive ? "bg-gray-200 dark:bg-neutral-700 rounded-md px-2" : "",
        className
      )}
    >
      {link.icon}
      <span
        className={cn(
          "text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0",
          {
            "opacity-0 hidden": !open,
            "opacity-100": open,
          }
        )}
      >
        {link.label}
      </span>
    </Link>
  );
};
