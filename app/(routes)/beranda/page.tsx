import { createClient } from "@/lib/supabase/server";
import BerandaClient from "./berandaclient";

export default async function BerandaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let firstName = "";
  let stats = null;
  let latestReports = [];

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .single();

    firstName = profile?.first_name || "";
  }

  // Statistik laporan
  const { count: total } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true });

  const { count: pending } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: done } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "done");

  stats = { total: total || 0, pending: pending || 0, done: done || 0 };

  // Ambil 3 laporan terbaru
  const { data: latest } = await supabase
    .from("reports")
    .select("id, description, image_url, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  latestReports = latest || [];

  return (
    <BerandaClient
      name={firstName}
      stats={stats}
      latestReports={latestReports}
    />
  );
}
