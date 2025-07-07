import { createClient } from "@/lib/supabase/server";
import ReportsClient from "./reportsclient";

export default async function AdminReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Harap login terlebih dahulu.</div>;
  //   console.log("User:", user);
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  //   console.log("Profile:", profile);
  if (profile?.role !== "admin") {
    return (
      <div className="text-red-500 text-center py-10">
        Akses ditolak: Hanya admin.
      </div>
    );
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  return <ReportsClient reports={reports || []} />;
}
