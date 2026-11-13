import { NextResponse } from "next/server";
import { TOKEN_COOKIE_NAME } from "./resources/utils/cookie";

export default function proxy(req) {
  const { cookies, nextUrl } = req;
  const publicRoutes = [];
  return NextResponse.next();

  if (cookies.has(TOKEN_COOKIE_NAME)) {
    if (nextUrl.pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else {
    if (nextUrl.pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
