import { NextResponse } from "next/server";
import { sendPushNotification } from "@/lib/notifications/sendPushNotification";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, body: message, url } = body;

  const result = await sendPushNotification({ title, body: message, url });

  return NextResponse.json(result);
}
