import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const ADMIN_ONLY_PREFIXES = ["/admin"];
const AGENT_PREFIXES = ["/saisie"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  const isAgentRoute = AGENT_PREFIXES.some((p) => pathname.startsWith(p));

  if (isAdminRoute && session.user.role !== "ADMIN_NATIONAL") {
    return NextResponse.redirect(new URL("/saisie", req.nextUrl.origin));
  }

  if (isAgentRoute && session.user.role !== "AGENT_SAISIE" && session.user.role !== "ADMIN_NATIONAL") {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/saisie/:path*"],
};
