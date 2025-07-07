"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // 🔍 Deteksi iOS
    const userAgent = window.navigator.userAgent;
    const isIOSDevice =
      /iphone|ipad|ipod/i.test(userAgent) &&
      !(window.navigator as any).standalone;

    setIsIOS(isIOSDevice);

    // 📦 Cek apakah sudah diinstal (iOS mode standalone)
    const standalone =
      "standalone" in window.navigator && (window.navigator as any).standalone;
    setIsInStandaloneMode(!!standalone);

    // 📥 Tangkap event install di browser lain (Chrome, Edge, dll)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener
      );
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();

    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted install");
    } else {
      console.log("User dismissed install");
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  if (isInStandaloneMode) return null; // ✅ Sudah terpasang

  return (
    <>
      {/* ✅ Untuk Chrome dan lainnya */}
      {isInstallable && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border rounded-md px-4 py-3 shadow z-[10000] w-[90%] max-w-sm">
          {/* <p className="text-sm mb-2">Install aplikasi WasteReport?</p> */}
          <div className="flex justify-center">
            <Button onClick={handleInstall}>📲 Install</Button>
          </div>
        </div>
      )}

      {/* ❗ Untuk iOS */}
      {isIOS && !isInstallable && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border rounded-md px-4 py-3 shadow z-[10000] w-[90%] max-w-sm">
          <p className="text-sm text-center">
            📲 Untuk menginstal aplikasi, tekan{" "}
            <span className="font-medium">Share</span> lalu pilih{" "}
            <span className="font-medium">Add to Home Screen</span>.
          </p>
        </div>
      )}
    </>
  );
}
