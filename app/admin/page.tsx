import { redirect } from "next/navigation";

function page() {
  return redirect("/admin/reports");
}

export default page;
