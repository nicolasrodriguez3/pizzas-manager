"use client";

import { useSidebar } from "@/app/lib/store/sidebar-store";
import { cn } from "@/lib/utils";

interface MainContentWrapperProps {
  children: React.ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const isCollapsed = useSidebar((state) => state.isCollapsed);

  // Use responsive utility classes (md:) to apply margins only on desktop.
  // On mobile (default), margin is 0 (implied).
  const marginClass = isCollapsed ? "md:ml-16" : "md:ml-64";

  return (
    <div
      className={cn(
        "overflow-y-auto flex-1 flex flex-col transition-all duration-300 ease-in-out",
        marginClass,
      )}
    >
      {children}
    </div>
  );
}
