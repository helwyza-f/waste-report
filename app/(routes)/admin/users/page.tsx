import { createClient } from "@/lib/supabase/server";
import UsersClient from "./usersclient";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role");

  return <UsersClient users={users || []} />;
}
