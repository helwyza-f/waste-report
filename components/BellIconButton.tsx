"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export function BellIconButton() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      if (!("Notification" in window)) return;

      const permission = Notification.permission;
      if (permission === "default") {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) setShow(true);
      }
    }

    checkPermission();
  }, []);

  const handleClick = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Memproses notifikasi...");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.dismiss(loadingToast);
        toast.error("Notifikasi ditolak");
        setShow(false);
        setLoading(false);
        return;
      }

      if (!("serviceWorker" in navigator)) {
        toast.dismiss(loadingToast);
        toast.error("Service worker tidak tersedia");
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        toast.dismiss(loadingToast);
        toast.success("Notifikasi sudah aktif");
        setShow(false);
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
      });

      toast.dismiss(loadingToast);
      toast.success("Notifikasi diaktifkan ✅");
      setShow(false);
    } catch (err) {
      console.error(err);
      toast.dismiss(loadingToast);
      toast.error("Gagal mengaktifkan notifikasi");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={loading}
    >
      <Bell className="w-5 h-5" />
      <span className="sr-only">Aktifkan notifikasi</span>
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
