"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function PushPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = Notification.permission;
      if (permission === "default") {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAllowNotification = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notifikasi diizinkan");
    } else {
      console.log("Notifikasi ditolak");
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-sm bg-white dark:bg-gray-800 border rounded-md px-4 py-3 shadow flex flex-col md:flex-row items-center justify-between gap-3">
      <p className="text-sm text-center md:text-left">
        🔔 Izinkan notifikasi untuk mendapatkan update laporan.
      </p>
      <Button size="sm" onClick={handleAllowNotification}>
        Izinkan
      </Button>
    </div>
  );
}
