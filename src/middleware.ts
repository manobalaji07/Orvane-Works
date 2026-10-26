import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected route prefixes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isEmployeeRoute = pathname.startsWith("/employee");
  const isAdminRoute = pathname.startsWith("/admin");
  const isAwaitingApprovalRoute = pathname === "/awaiting-approval";

  // Check if current route is protected
  if (!isDashboardRoute && !isEmployeeRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Session token check from cookies (Supabase auth tokens, including chunked .0, .1)
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  // If user is not authenticated, redirect to login with callbackUrl
  if (!hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/employee/:path*",
    "/admin/:path*",
    "/awaiting-approval",
  ],
};
