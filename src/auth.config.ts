import type { NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authConfig = {
  // Required for self-hosted deployments (Docker on a VPS, not Vercel/Netlify):
  // without this, Auth.js v5 refuses any request whose Host header isn't a
  // platform it auto-trusts, throwing "UntrustedHost" on every sign-in,
  // session check and sign-out in production — which breaks login/logout
  // and can make redirects fall back to the configured NEXTAUTH_URL instead
  // of the real request origin. Safe to trust here because the app is only
  // ever exposed via the reverse proxy / port mapping we control.
  // https://errors.authjs.dev#untrustedhost
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
