import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ReportDetailClient from "./reportdetailclient";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ Tangkap id dari promise

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

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

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id) // ✅ Gunakan id hasil await
    .single();

  if (!report) notFound();

  return <ReportDetailClient report={report} />;
}
