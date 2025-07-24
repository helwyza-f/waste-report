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
     * - sw.js (service worker)
     * - manifest.json (web manifest)
     * - workbox-*.js & worker-*.js (generated PWA files)
     * - static image extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|workbox-[a-zA-Z0-9]+\\.js|worker-[a-zA-Z0-9]+\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

