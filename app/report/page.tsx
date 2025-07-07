// app/report/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReportClient from "./reportclient";

export default async function ReportPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <ReportClient user={user} />;
}
