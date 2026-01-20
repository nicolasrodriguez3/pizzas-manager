import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/register",
  },
  providers: [], // Configured in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // Routes that require authentication
      const protectedPaths = [
        "/dashboard",
        "/ingredients",
        "/products",
        "/sales",
        "/account",
      ];
      const isProtectedRoute = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      // Auth routes (login/register)
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.organizationId && session.user) {
        session.user.organizationId = token.organizationId;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.organizationId = user.organizationId;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
