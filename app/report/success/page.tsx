import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <CheckCircle className="text-green-500 w-16 h-16 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Laporan Berhasil Dikirim 🎉</h1>
      <p className="text-muted-foreground max-w-md mb-6">
        Terima kasih telah melaporkan. Laporan Anda akan segera ditinjau oleh
        tim kami.
      </p>

      <div className="flex gap-4">
        <Button asChild variant="default">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/map">Lihat Peta Sampah</Link>
        </Button>
      </div>
    </div>
  );
}
