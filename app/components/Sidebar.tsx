"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  ShoppingCart,
  Pizza,
  Carrot,
  ShoppingBag,
  TrendDown,
  User,
  SignOut,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/Button";
import { handleSignOut } from "@/app/actions/auth"; // We might need to adjust this depending on how sign out works, but UserHeader used it directly.
// UserHeader imported handleSignOut from "@/app/actions/auth".

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

const MENU_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { name: "Ventas", href: "/sales", icon: ShoppingCart },
  { name: "Productos", href: "/products", icon: Pizza },
  { name: "Ingredientes", href: "/ingredients", icon: Carrot },
  { name: "Compras", href: "/purchases", icon: ShoppingBag },
  { name: "Gastos", href: "/expenses", icon: TrendDown },
  { name: "Mi Cuenta", href: "/account", icon: User },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-white md:flex text-sm">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl"
        >
          <Pizza className="text-orange-500" size={32} weight="fill" />
          <span>Pizza Manager</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                isActive
                  ? "bg-orange-50 text-orange-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon size={20} weight={isActive ? "fill" : "regular"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <User size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="truncate font-medium text-gray-900">
              {user.name || "Usuario"}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <form action={handleSignOut} className="w-full">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-600"
            type="submit"
          >
            <SignOut size={18} className="mr-2" />
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
