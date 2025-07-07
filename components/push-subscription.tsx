"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Ganti dengan public VAPID key kamu (lihat langkah 2)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

export default function PushSubscription() {
  useEffect(() => {
    const subscribe = async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push not supported");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      const sw = await navigator.serviceWorker.ready;
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Simpan subscription ke Supabase
      const supabase = createClient();
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      await supabase.from("subscriptions").upsert({
        user_id: user.data.user.id,
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
      });

      console.log("Subscribed to push:", subscription);
    };

    subscribe();
  }, []);

  return null;
}

// helper
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
