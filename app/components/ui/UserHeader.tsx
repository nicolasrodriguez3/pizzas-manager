import { auth } from "@/app/auth"
import { Button } from "./Button"
import { handleSignOut } from "@/app/actions/auth"

export async function UserHeader() {
    const session = await auth()

    if (!session?.user) return null

    return (
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">{session.user.name}</p>
                <p className="text-xs text-gray-400">{session.user.email}</p>
            </div>
            <form action={handleSignOut}>
                <Button variant="secondary" className="text-sm py-1 px-3">
                    Sign Out
                </Button>
            </form>
        </div>
    )
}
