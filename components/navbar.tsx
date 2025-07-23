"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<"user" | "admin" | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole((profile?.role as "user" | "admin") || "user");
      } else {
        setIsLoggedIn(false);
        setRole(null);
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
        if (session?.user) {
          supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single()
            .then(({ data }) =>
              setRole((data?.role as "user" | "admin") || "user")
            );
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
    setIsLoggedIn(false);
  };

  // ✅ Link dinamis berdasarkan role
  const navItems =
    role === "admin"
      ? [
          { label: "Dashboard", href: "/admin/reports" },
          { label: "Peta Admin", href: "/admin/map" },
          { label: "Kelola Pengguna", href: "/admin/users" },
          { label: "Notifikasi", href: "/admin/notifications" },
          { label: "Profil", href: "/profile" },
        ]
      : [
          { label: "Beranda", href: "/beranda" },
          { label: "Lapor Sampah", href: "/report" },
          { label: "Peta Sampah", href: "/map" },
          { label: "Riwayat", href: "/history" },
          { label: "Profil", href: "/profile" },
        ];

  return (
    <nav className="w-full border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-primary">
          ♻️ WasteReport
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname.startsWith(item.href)
                  ? "text-primary underline"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <ThemeSwitcher />
          {isLoggedIn ? (
            <Button size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/auth/login">Masuk</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/sign-up">Daftar</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Sidebar */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 px-4 py-6 z-[10001]">
              <SheetTitle className="sr-only">Navigasi</SheetTitle>

              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-base font-medium transition-colors ${
                      pathname === item.href
                        ? "text-primary underline"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t mt-6 pt-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tema</span>
                  <ThemeSwitcher />
                </div>

                {isLoggedIn ? (
                  <Button size="sm" onClick={handleLogout}>
                    Keluar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/auth/login">Masuk</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href="/auth/sign-up">Daftar</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
