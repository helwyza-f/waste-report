"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Report } from "../map/types";
import Image from "next/image";
import { format } from "date-fns";
import { Clock, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function HistoryClient({ reports }: { reports: Report[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Yakin ingin menghapus laporan ini?");
    if (!confirm) return;

    startTransition(async () => {
      const res = await fetch(`/api/report/delete?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Laporan berhasil dihapus.");
        router.refresh();
      } else {
        const result = await res.json();
        toast.error(result.error || "Gagal menghapus laporan.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Riwayat Laporan Anda</h1>

      {reports.length === 0 ? (
        <p className="text-muted-foreground">Belum ada laporan.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <Card key={r.id} className="p-4 flex gap-4 items-start">
              {r.image_url && (
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${r.image_url}`}
                  alt="preview"
                  width={96}
                  height={96}
                  className="rounded object-cover h-24 w-24"
                />
              )}
              <div className="flex-1 space-y-2">
                <p className="text-sm">{r.description}</p>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {r.status === "pending" ? (
                      <>
                        <Trash2 className="w-3 h-3 mr-1" />
                        Pending
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Selesai
                      </>
                    )}
                  </Badge>
                  {r.urgency && (
                    <Badge variant="secondary" className="text-xs">
                      ⚠️ Urgensi: {r.urgency}
                    </Badge>
                  )}
                  <Badge className="text-xs" variant="outline">
                    <Clock className="w-3 h-3 mr-1" />
                    {r.created_at
                      ? format(new Date(r.created_at), "dd MMM yyyy, HH:mm")
                      : "Tanggal tidak tersedia"}
                  </Badge>
                </div>

                {r.status === "pending" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() => handleDelete(r.id)}
                  >
                    Hapus Laporan
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
