"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export default function PushPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUserAndPermission = async () => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator
      ) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const permission = Notification.permission;

        if (user && permission === "default") {
          setShowBanner(true);
        }
      }
    };

    checkUserAndPermission();
  }, []);
  // Fungsi untuk mengizinkan notifikasi
  // Ini akan meminta izin kepada pengguna untuk mengaktifkan notifikasi

  const handleAllowNotification = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Memproses permintaan...");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.dismiss(loadingToast);
        toast.error("Notifikasi ditolak");
        setShowBanner(false);
        setIsLoading(false);
        return;
      }

      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.dismiss(loadingToast);
        toast.error("Push tidak didukung di browser ini");
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // ✅ CEK jika sudah terdaftar sebelumnya
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (existingSubscription) {
        toast.dismiss(loadingToast);
        toast.success("Notifikasi sudah diaktifkan");
        setShowBanner(false);
        setIsLoading(false);
        return;
      }

      // 🆕 Jika belum ada, buat subscription baru
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.dismiss(loadingToast);
        toast.error("User tidak ditemukan");
        setIsLoading(false);
        return;
      }

      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
      });

      toast.dismiss(loadingToast);
      toast.success("Notifikasi diaktifkan ✅");
      setShowBanner(false);
    } catch (error) {
      console.error("Gagal mengaktifkan notifikasi:", error);
      toast.dismiss(loadingToast);
      toast.error("Terjadi kesalahan. Coba lagi.");
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

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
