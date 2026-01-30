"use client";

import { EllipsisIcon, User } from "lucide-react";
import Link from "next/link";

import { handleSignOut } from "@/actions/auth";
import { toggleSidebarCookie } from "@/actions/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/sidebar-store";
import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";
import { NavItemComponent } from "./NavItem";
import { SidebarToggle } from "./SidebarToggle";

interface SidebarProps {
  className?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ className, user }: SidebarProps) {
  const isMobileOpen = useSidebar((state) => state.isOpen);
  const isCollapsed = useSidebar((state) => state.isCollapsed);
  const closeSidebar = useSidebar((state) => state.closeSidebar);
  const toggleCollapseStore = useSidebar((state) => state.toggleCollapse);

  const isMobile = useIsMobile();

  useBodyScrollLock(isMobile && isMobileOpen);

  const handleToggleCollapse = async () => {
    toggleCollapseStore();
    await toggleSidebarCookie(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? "md:w-16" : "md:w-64";
  const sidebarClasses = cn(
    "fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
    // Mobile Styles (max-md target mobile only, independent of isMobile JS state for initial render)
    "max-md:w-64 max-md:shadow-lg",
    isMobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
    // Desktop Styles
    "md:translate-x-0",
    sidebarWidth,
    className,
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={sidebarClasses}>
        {/* Logo */}
        {isMobile && (
          <div className="flex items-center justify-center h-16 px-2 bg-linear-to-r from-orange-500 to-red-600 border-b border-orange-600">
            <h1 className="text-xl font-bold text-white">Pizza Manager</h1>
          </div>
        )}

        {/* Navigation */}
        <TooltipProvider>
          <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
            {navigationItems.map((item) => (
              <NavItemComponent
                key={item.name}
                item={item}
                isCollapsed={isCollapsed}
                isMobile={isMobile}
              />
            ))}
          </nav>
        </TooltipProvider>

        {/* Desktop toggle */}
        {!isMobile && (
          <div className="p-2 flex items-center justify-center">
            <SidebarToggle
              isCollapsed={isCollapsed}
              onToggle={handleToggleCollapse}
            />
          </div>
        )}

        {/* Footer */}
        <div className="p-3 py-4 border-t border-gray-200">
          {(!isCollapsed || isMobile) && user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <div className="flex items-center rounded-full bg-gray-100 p-2">
                    <User size={24} />
                  </div>
                </Link>
                <div className="flex flex-col items-start text-left">
                  <Link
                    href="/account"
                    className="text-sm font-medium text-gray-800"
                  >
                    {user.name}
                  </Link>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <EllipsisIcon size={24} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-gray-200">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <form>
                        <Button
                          type="button"
                          onClick={handleSignOut}
                          variant="secondary"
                          className="w-full text-sm py-1 px-3 cursor-pointer hover:bg-gray-100"
                        >
                          Cerrar Sesión
                        </Button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            isCollapsed &&
            !isMobile && (
              <div className="flex justify-center items-center">
                <Link
                  href="/account"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <div className="flex size-10 justify-center items-center rounded-full bg-gray-100">
                    <User size={24} />
                  </div>
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
