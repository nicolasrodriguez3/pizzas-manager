"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NavItem } from "@/app/lib/navigation";

interface NavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isMobile?: boolean;
}

export function NavItemComponent({
  item,
  isCollapsed,
  isMobile,
}: NavItemProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = pathname === item.href;
  const hasSubmenu = item.quickActions && item.quickActions.length > 0;

  const handleClick = () => {
    if (hasSubmenu && !isMobile) {
      setIsExpanded(!isExpanded);
    }
  };

  useEffect(() => {
    if (isCollapsed) {
      setIsExpanded(false);
    }
  }, [isCollapsed]);

  return (
    <div className="relative">
      <div className="flex gap-1 items-center">
        <Link
          href={item.href}
          className={cn(
            "flex grow items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
            isActive
              ? "bg-orange-50 text-orange-700 border-r-2 border-orange-500"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            isCollapsed && !isMobile && "justify-center px-1",
            isMobile && "w-full justify-start",
          )}
        >
          <item.icon
            className={cn(
              "w-5 h-5 shrink-0",
              isCollapsed && !isMobile ? "mr-0" : "mr-3",
              isActive
                ? "text-orange-600"
                : "text-gray-400 group-hover:text-gray-600",
            )}
          />

          {(!isCollapsed || isMobile) && (
            <>
              <span className="truncate">{item.name}</span>

              {item.badge && (
                <span className="ml-auto bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </>
          )}

          {/* {isCollapsed && !isMobile && hasSubmenu && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
            {item.quickActions?.[0]?.name}
          </div>
        ) */}

          {/* Tooltip para collapsed state */}
          {isCollapsed && !isMobile && (
            <div className="absolute left-full ml-2 top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
              {item.name}
              {item.description && (
                <>
                  <br />
                  <span className="text-gray-300">{item.description}</span>
                </>
              )}
            </div>
          )}
        </Link>

        {/* Desktop submenu toggle */}
        {hasSubmenu && !isMobile && !isCollapsed && (
          <button
            className="hover:bg-gray-50 p-2 rounded-lg"
            onClick={handleClick}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 ml-auto transition-transform",
                isExpanded ? "rotate-180" : "",
              )}
            />
          </button>
        )}
      </div>

      {/* Quick Actions Submenu */}
      {hasSubmenu && isExpanded && !isMobile && (
        <div className="ml-6 mt-1 space-y-1">
          {item.quickActions!.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.name}
            </Link>
          ))}
        </div>
      )}

      {/* Mobile submenu */}
      {hasSubmenu && isMobile && (
        <div className="ml-8 mt-1 space-y-1">
          {item.quickActions!.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="flex items-center px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
