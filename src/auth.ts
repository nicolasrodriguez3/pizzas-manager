import { headers } from "next/headers";

import { authConfig } from "@/lib/auth";

export async function auth() {
  return await authConfig.api.getSession({
    headers: await headers(),
  });
}
