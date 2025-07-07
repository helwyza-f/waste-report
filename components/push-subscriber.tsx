"use client";

import { useEffect } from "react";

export default function PushSubscriber() {
  useEffect(() => {
    const registerPush = async () => {
      if (!("serviceWorker" in navigator)) return;
      if (!("PushManager" in window)) return;

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) return; // sudah langganan

      const res = await fetch("/api/subscribe");
      const { publicKey } = await res.json();

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify(newSubscription),
        headers: { "Content-Type": "application/json" },
      });
    };

    registerPush();
  }, []);

  return null;
}

// convert VAPID key dari string ke Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);

  return outputArray;
}
