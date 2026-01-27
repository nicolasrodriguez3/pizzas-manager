import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { MainContentWrapper } from "@/components/MainContentWrapper";
import { SidebarProvider } from "@/store/sidebar-store";

import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pizza Manager",
  description:
    "Gestiona tus ingredientes, recetas y ventas de pizzas en tiempo real.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultCollapsed =
    cookieStore.get("sidebar:collapsed")?.value === "true";

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider defaultCollapsed={defaultCollapsed}>
          <div className="relative flex min-h-screen bg-gray-50">
            <Sidebar user={session?.user} />
            <MainContentWrapper>
              <TopBar title="Pizza Manager" user={session?.user} />
              <main className="flex-1">{children}</main>
            </MainContentWrapper>
          </div>
        </SidebarProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
