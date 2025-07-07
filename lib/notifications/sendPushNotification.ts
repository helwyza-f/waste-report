import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  "mailto:admin@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function sendPushNotification({
  title,
  body,
  url,
}: {
  title: string;
  body: string;
  url?: string;
}) {
  const supabase = await createClient();
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("*");

  if (error) {
    console.error("❌ Failed to get subscriptions", error);
    return { sent: 0, error };
  }

  const payload = JSON.stringify({ title, body, url });
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
      console.error("❌ Push failed for", sub.endpoint, err);
    }
  }

  return { sent };
}
