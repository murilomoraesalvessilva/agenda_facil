// src/middleware.ts
export const runtime = "nodejs";

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/onboarding"];

export default auth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isProtected = PROTECTED_ROUTES.some(route =>
    nextUrl.pathname.startsWith(route)
  );

  // Rota protegida sem sessão → redireciona para login
  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*"],
};