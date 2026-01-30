import { toNextJsHandler } from "better-auth/next-js";

import { authConfig } from "@/lib/auth";

export const { POST, GET } = toNextJsHandler(authConfig);
