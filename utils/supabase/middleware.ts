import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh the session before returning the response so refreshed cookies are preserved.
  const { data } = await supabase.auth.getClaims();

  const pathname = request.nextUrl.pathname;
  const isAuthenticated = Boolean(data?.claims);
  const isPublicRoute =
    pathname === "/login" || pathname === "/activate-account";
  const isPrivateRoute =
    pathname === "/" || pathname === "/kids" || pathname.startsWith("/kids/");

  if ((!isAuthenticated && isPrivateRoute) || (isAuthenticated && isPublicRoute)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAuthenticated ? "/" : "/login";
    redirectUrl.search = "";

    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
