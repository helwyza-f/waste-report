import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, body: message, url } = body;

  const supabase = await createClient();

  // Ambil semua subscriptions
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*");
  if (error || !subscriptions) {
    return NextResponse.json(
      { error: "Gagal ambil subscription" },
      { status: 500 }
    );
  }

  // Set VAPID details
  webpush.setVapidDetails(
    "mailto:admin@wastereport.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY!
  );

  // Siapkan payload
  const payload = JSON.stringify({
    title: title || "WasteReport Notifikasi",
    body: message || "Ada update dari sistem.",
    icon: "/icons/icon-192x192.png",
    url: url || "/",
  });

  // Kirim ke semua
  const results = await Promise.allSettled(
    subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: sub.keys,
      };
      return webpush.sendNotification(pushSubscription, payload);
    })
  );

  return NextResponse.json({
    success: true,
    sent: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
  });
}
