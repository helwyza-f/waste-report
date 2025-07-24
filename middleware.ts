import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /**
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - image assets (svg, png, jpg, etc.)
     * - sw.js (service worker)
     * - workbox-*.js (service worker dependencies)
     * - manifest.json (web manifest)
     */
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|workbox-[a-zA-Z0-9]+\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
