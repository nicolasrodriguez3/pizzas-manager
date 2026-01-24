import { Sidebar } from "@/app/components/Sidebar";
import { SidebarTrigger } from "@/app/components/SidebarTrigger";
import { MainContentWrapper } from "./MainContentWrapper";
import { SidebarProvider } from "@/app/lib/store/sidebar-store";
import { cookies } from "next/headers";

import { auth } from "@/app/auth";

export const metadata = {
  title: "Pizza Manager",
  description: "Gestión gastronómica simplificada",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get("sidebar:collapsed")?.value === "true";

  return (
    <SidebarProvider defaultCollapsed={defaultCollapsed}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar user={session?.user} />
        <MainContentWrapper>
          <header className="flex md:hidden bg-white border-b border-gray-200 px-6 py-4 shadow-sm items-center justify-between">
            <SidebarTrigger />
          </header>
          <main className="flex-1">{children}</main>
        </MainContentWrapper>
      </div>
    </SidebarProvider>
  );
}
