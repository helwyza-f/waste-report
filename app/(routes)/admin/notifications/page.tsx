import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NotificationFormClient from "./client";

export default async function NotificationPage() {
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

  return <NotificationFormClient />;
}
