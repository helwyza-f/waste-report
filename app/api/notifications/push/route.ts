import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function POST(req: Request) {
  const body = await req.json();
  const { title, body: message, url } = body;

  const supabase = await createClient();
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("*");

  const payload = JSON.stringify({
    title,
    body: message,
    url,
  });

  let sent = 0;

  for (const sub of subscriptions || []) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: sub.keys,
        },
        payload
      );
      sent++;
    } catch (err) {
      console.error("Push failed for endpoint", sub.endpoint, err);
    }
  }

  return NextResponse.json({ sent });
}
