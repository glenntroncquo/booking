import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/widget") {
    const response = NextResponse.next();
    response.headers.delete("X-Frame-Options");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/widget"],
};
