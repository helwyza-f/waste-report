type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function sendNotification(payload: PushPayload) {
  try {
    const res = await fetch("/api/notifications/push", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result?.error || "Gagal mengirim notifikasi");
    return result;
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi:", error);
    return { sent: 0 };
  }
}
