"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export default function PushPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = Notification.permission;
      if (permission === "default") {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAllowNotification = async () => {
    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notifikasi ditolak");
        setShowBanner(false);
        return;
      }

      console.log("🔔 Notifikasi diizinkan");

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push tidak didukung di browser ini");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
      });

      console.log("✅ Subscription berhasil disimpan ke Supabase");
      setShowBanner(false);
    } catch (err) {
      console.error("❌ Gagal meminta notifikasi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-sm bg-white dark:bg-gray-800 border rounded-md px-4 py-3 shadow flex flex-col md:flex-row items-center justify-between gap-3">
      <p className="text-sm text-center md:text-left">
        🔔 Izinkan notifikasi untuk mendapatkan update laporan.
      </p>
      <Button size="sm" onClick={handleAllowNotification} disabled={isLoading}>
        {isLoading ? "Memproses..." : "Izinkan"}
      </Button>
    </div>
  );
}

// helper untuk VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
