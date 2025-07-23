import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "./clientpage";

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <HistoryClient reports={reports || []} />;
}
