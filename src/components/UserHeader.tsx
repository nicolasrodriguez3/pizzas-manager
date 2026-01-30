import { UserIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

import { handleSignOut } from "@/actions/auth";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function UserHeader() {
  const session = await auth();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <Link href="/account">
          <div className="flex items-center rounded-full bg-gray-100 p-2">
            <UserIcon size={24} weight="light" />
          </div>
        </Link>
        <div className="flex flex-col items-start text-left">
          <Link href="/account" className="text-sm font-medium text-gray-800">
            {session.user.name}
          </Link>
          <p className="text-xs text-gray-600">{session.user.email}</p>
        </div>
      </div>
      <form action={handleSignOut}>
        <Button variant="secondary" className="text-sm py-1 px-3">
          Sign Out
        </Button>
      </form>
    </div>
  );
}
