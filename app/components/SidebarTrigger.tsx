"use client";

import { ListIcon } from "@phosphor-icons/react";
import { Button } from "./ui/Button";
import { useSidebar } from "@/app/lib/store/sidebar-store";
import { cn } from "@/lib/utils";

interface SidebarTriggerProps {
  className?: string;
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const openSidebar = useSidebar((state) => state.openSidebar);

  return (
    <Button
      variant="secondary"
      onClick={openSidebar}
      className={cn("md:hidden", className)}
      type="button"
    >
      <ListIcon size={24} />
    </Button>
  );
}
