import { createClient } from "@/lib/supabase/server";
import MapClientWrapper from "./clientpage";

export default async function MapPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, location, status, image_url, description, urgency, user_id");

  return (
    <MapClientWrapper reports={reports || []} currentUserId={user?.id || ""} />
  );
}
