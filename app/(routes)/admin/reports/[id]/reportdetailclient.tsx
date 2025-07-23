"use client";

import { useRouter } from "next/navigation";
import { Report } from "@/app/(routes)/map/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportDetailClient({ report }: { report: Report }) {
  const supabase = createClient();
  const router = useRouter();

  const handleUpdateStatus = async () => {
    const newStatus = report.status === "done" ? "pending" : "done";
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", report.id);

    if (error) {
      toast.error("Gagal mengubah status");
    } else {
      toast.success(`Status diubah menjadi ${newStatus}`);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    const confirmDelete = confirm("Yakin ingin menghapus laporan ini?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("reports")
      .delete()
      .eq("id", report.id);
    if (error) {
      toast.error("Gagal menghapus laporan");
    } else {
      toast.success("Laporan dihapus");
      router.push("/admin/reports");
    }
  };

  const createdAt = report.created_at
    ? format(new Date(report.created_at), "dd MMM yyyy, HH:mm")
    : "-";

  const imageUrl = report.image_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${report.image_url}`
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">📝 Detail Laporan</h1>
        <Link href="/admin/reports" className="text-blue-500 underline text-sm">
          ← Kembali
        </Link>
      </div>

      <Card>
        {imageUrl && (
          <div className="w-1/2 mx-auto rounded-t-md overflow-hidden max-h-72 bg-muted">
            <Image
              src={imageUrl}
              alt="preview"
              width={640}
              height={480}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        <CardHeader>
          <CardTitle className="text-lg">Informasi Laporan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div>
            <span className="font-semibold">🧾 Deskripsi:</span>{" "}
            {report.description || "Tidak ada"}
          </div>
          <div>
            <span className="font-semibold">⚠️ Urgensi:</span>{" "}
            <span className="capitalize">{report.urgency}</span>
          </div>
          <div>
            <span className="font-semibold">⏰ Status:</span>{" "}
            <span className="capitalize">{report.status}</span>
          </div>
          <div>
            <span className="font-semibold">📍 Lokasi:</span>{" "}
            {report.location || "-"}
          </div>
          <div>
            <span className="font-semibold">🕒 Waktu Lapor:</span> {createdAt}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleUpdateStatus}>
          {report.status === "done"
            ? "Ubah ke ⏳ Pending"
            : "Ubah ke ✅ Selesai"}
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Hapus Laporan ❌
        </Button>
      </div>
    </div>
  );
}
