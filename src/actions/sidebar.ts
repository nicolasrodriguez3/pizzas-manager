"use server";

import { cookies } from "next/headers";

export async function toggleSidebarCookie(collapsed: boolean) {
  const cookieStore = await cookies();
  cookieStore.set("sidebar:collapsed", collapsed ? "true" : "false", {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}
