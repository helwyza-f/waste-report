import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID laporan tidak ditemukan." },
      { status: 400 }
    );
  }

  // Ambil laporan
  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("image_url, status")
    .eq("id", id)
    .single();

  if (fetchError || !report) {
    return NextResponse.json(
      { error: "Laporan tidak ditemukan." },
      { status: 404 }
    );
  }

  if (report.status !== "pending") {
    return NextResponse.json(
      { error: "Laporan hanya bisa dihapus saat status pending." },
      { status: 403 }
    );
  }

  // Hapus dari Storage
  if (report.image_url) {
    await supabase.storage.from("report-images").remove([report.image_url]);
  }

  // Hapus dari database
  const { error: deleteError } = await supabase
    .from("reports")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: "Gagal menghapus laporan." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
