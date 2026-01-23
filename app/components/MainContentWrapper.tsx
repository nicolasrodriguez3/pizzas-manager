"use client";

import { useSidebarStore } from "@/app/lib/store/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/app/hooks/use-mobile";

interface MainContentWrapperProps {
  children: React.ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const { isCollapsed, isOpen } = useSidebarStore();
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        "overflow-y-auto flex-1 flex flex-col transition-all duration-300 ease-in-out",
        // Add left margin for desktop fixed sidebar
        !isMobile && (isCollapsed ? "ml-16" : "ml-64"),
        // Prevent scrolling when mobile sidebar is open
        isOpen && isMobile && "overflow-hidden",
      )}
    >
      {children}
    </div>
  );
}
