"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function NotificationPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");

  const handleSend = async () => {
    const res = await fetch("/api/notifications/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, url }),
    });

    const result = await res.json();
    toast.success(`Notifikasi dikirim ke ${result.sent} pengguna`);
    setTitle("");
    setBody("");
    setUrl("");
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-4">
      <h1 className="text-xl font-bold">📢 Kirim Notifikasi</h1>
      <Input
        placeholder="Judul notifikasi"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Textarea
        placeholder="Isi pesan"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <Input
        placeholder="URL tujuan (opsional)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={handleSend}>🚀 Kirim</Button>
    </div>
  );
}
