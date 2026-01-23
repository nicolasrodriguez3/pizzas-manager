"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { SidebarToggle } from "./SidebarToggle";
import { NavItemComponent } from "./NavItem";
import { navigationItems } from "@/app/lib/navigation";
import { useIsMobile } from "../hooks/use-mobile";
import { useSidebarStore } from "@/app/lib/store/sidebar";
import Link from "next/link";
import { UserIcon } from "@phosphor-icons/react";
import { handleSignOut } from "@/app/actions/auth";

import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ className, user }: SidebarProps) {
  const {
    isOpen: isMobileOpen,
    isCollapsed,
    closeSidebar,
    setCollapsed,
    toggleCollapse,
  } = useSidebarStore();
  const isMobile = useIsMobile();

  // Reset collapsed state on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);
    }
  }, [isMobile, setCollapsed]);

  const sidebarWidth = isCollapsed && !isMobile ? "w-16" : "w-64";
  const sidebarClasses = cn(
    "fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
    isMobile ? "shadow-lg" : "",
    sidebarWidth,
    !isMobileOpen && isMobile && "-translate-x-full",
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
        <div className="flex items-center justify-center h-16 px-2 bg-linear-to-r from-orange-500 to-red-600 border-b border-orange-600">
          {!isCollapsed || isMobile ? (
            <h1 className="text-xl font-bold text-white">Pizza Manager</h1>
          ) : (
            <div className="size-10 bg-white/20 text-white rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm">PM</span>
            </div>
          )}
        </div>

        {/* Desktop toggle */}
        {!isMobile && (
          <div className="p-2 border-b border-gray-200">
            <SidebarToggle
              isCollapsed={isCollapsed}
              onToggle={toggleCollapse}
            />
          </div>
        )}

        {/* Navigation */}
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

        {/* Footer */}
        <div className="p-2 border-t border-gray-200">
          {(!isCollapsed || isMobile) && user ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <Link href="/account">
                  <div className="flex items-center rounded-full bg-gray-100 p-2">
                    <UserIcon size={24} weight="light" />
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

              <form action={handleSignOut}>
                <Button
                  variant="secondary"
                  className="w-full text-sm py-1 px-3"
                >
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            isCollapsed &&
            !isMobile && (
              <div className="text-center">
                <Link href="/account">
                  <div className="flex size-12 justify-center items-center rounded-full bg-gray-100 text-gray-600">
                    <UserIcon size={24} weight="regular" />
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
