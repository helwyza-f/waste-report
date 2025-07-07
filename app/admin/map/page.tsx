// app/admin/map/page.tsx
import { createClient } from "@/lib/supabase/server";
import Wrapper from "./wrapper";

export default async function AdminMapPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return <div>Silakan login dulu.</div>;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="text-red-500 text-center py-10">
        Akses ditolak: hanya admin.
      </div>
    );
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  return <Wrapper reports={reports || []} />;
}
