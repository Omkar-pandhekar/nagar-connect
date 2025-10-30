import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (
      token &&
      (pathname.includes("login") || pathname.includes("register"))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      !token &&
      (pathname.includes("dashboard") || pathname.includes("map"))
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/login", "/register", "/map/:path*", "/dashboard/:path*"],
};
