"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
type Props = {
  name?: string;
  stats?: {
    total: number;
    pending: number;
    done: number;
  };
  latestReports?: {
    id: string;
    description: string;
    image_url: string | null;
    created_at: string;
  }[];
};

export default function BerandaClient({ name, stats, latestReports }: Props) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      {/* Header seperti sebelumnya */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">
          👋 Halo{name ? `, ${name}` : ""}! Selamat Datang di{" "}
          <span className="text-green-600">WasteReport</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Bantu kami menjaga lingkungan dengan melaporkan sampah yang tidak pada
          tempatnya.
        </p>
        <Button asChild size="lg" className="text-lg">
          <Link href="/report">📸 Laporkan Sampah Sekarang</Link>
        </Button>
      </div>

      {/* ✅ Statistik */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-background rounded-md p-4 shadow">
            <p className="text-sm text-muted-foreground">Total Laporan</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 rounded-md p-4 shadow">
            <p className="text-sm">Pending</p>
            <p className="text-xl font-semibold">{stats.pending}</p>
          </div>
          <div className="bg-green-100 text-green-800 rounded-md p-4 shadow">
            <p className="text-sm">Selesai</p>
            <p className="text-xl font-semibold">{stats.done}</p>
          </div>
        </div>
      )}

      {/* 🕒 Laporan Terbaru */}
      {latestReports && latestReports.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">🕒 Laporan Terbaru</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {latestReports.map((r) => (
              <div
                key={r.id}
                className="border rounded-md p-3 space-y-2 shadow-sm"
              >
                {r.image_url && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${r.image_url}`}
                    alt="Gambar laporan"
                    className="rounded-md object-cover h-40 w-full"
                    width={200}
                    height={100}
                  />
                )}
                <p className="text-sm line-clamp-2">{r.description}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
