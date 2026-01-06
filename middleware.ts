import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Engedjük a login és register oldalakat
    if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register") {
      return NextResponse.next();
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Publikus útvonalak (auth nélkül is elérhetőek)
        const publicPaths = ["/login", "/register"];
        
        if (publicPaths.includes(req.nextUrl.pathname)) {
          return true;
        }
        
        // Minden más oldalhoz kell token (bejelentkezés)
        return !!token;
      },
    },
  }
);

export const config = {
  // A matcher kizárja az API-t és a statikus fájlokat az ellenőrzés alól
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};