"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import Image from "next/image";
import { toast } from "sonner";
import { Loader2, MapPin, UploadCloud, ImageIcon, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

import { convertToBase64, getCurrentLocation } from "@/lib/utils/form";
import { buildPrompt } from "@/lib/utils/prompt";
import { sendNotification } from "@/lib/utils/send-notification";

// Leaflet map import
const DynamicMap = dynamic(() => import("@/components/DynamicMap"), {
  ssr: false,
});

const schema = z.object({
  description: z.string().min(5, "Deskripsi minimal 5 karakter"),
  image: z
    .custom<File>()
    .refine((file) => file instanceof File, "Gambar wajib diunggah."),
});

type FormData = z.infer<typeof schema>;

type Props = {
  user: User;
};

export default function ReportClient({ user }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const router = useRouter();
  const image = watch("image");

  const [preview, setPreview] = useState<string | null>(null);
  const [useMap, setUseMap] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [verified, setVerified] = useState<{
    wasteType: string;
    quantity: string;
    confidence: number;
    urgency: string;
  } | null>(null);

  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      toast.error("Format gambar harus JPG atau PNG");
      return;
    }

    setValue("image", file);
    setPreview(URL.createObjectURL(file));
    setVerified(null);
    fetchLocation();
  };

  const fetchLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err: any) {
      toast.error(err);
    }
  };

  const onVerify = async (data: FormData) => {
    if (!location) {
      toast.error("Lokasi belum tersedia.");
      return;
    }

    setLoadingVerify(true);
    try {
      const base64 = await convertToBase64(data.image);
      const prompt = buildPrompt(data.description, location);

      const res = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({
          image: base64,
          mime: data.image.type,
          prompt,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setVerified(result);
      toast.success("✅ Gambar berhasil diverifikasi");
    } catch (err: any) {
      toast.error(err.message || "Verifikasi gagal");
      setVerified(null);
    } finally {
      setLoadingVerify(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!verified || !location) {
      toast.error("Lengkapi data terlebih dahulu!");
      return;
    }

    setLoadingSubmit(true);
    const formData = new FormData();
    formData.append("file", data.image);
    formData.append("userId", user.id);
    formData.append("lat", location.lat.toString());
    formData.append("lng", location.lng.toString());
    formData.append("description", data.description);
    formData.append("wasteType", verified.wasteType);
    formData.append("quantity", verified.quantity);
    formData.append("confidence", verified.confidence.toString());
    formData.append("urgency", verified.urgency);

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error);
      }

      toast.success("🎉 Laporan berhasil dikirim!");
      await sendNotification({
        title: "Laporan Sampah Baru",
        body: `Laporan baru dari ${user.email || user.id}`,
        url: "/report",
      });
      router.push("/report/success");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim laporan");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Laporkan Sampah</h1>

      {/* Upload Gambar */}
      <Card className="p-4 flex flex-col gap-2 items-center">
        <Label htmlFor="image" className="cursor-pointer">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={240}
              height={240}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center bg-muted rounded-md">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onImageChange}
        />
        {errors.image && (
          <p className="text-xs text-red-500">{errors.image.message}</p>
        )}
      </Card>

      {/* Deskripsi */}
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        <Textarea
          id="description"
          placeholder="Contoh: Tumpukan sampah plastik di pinggir jalan dekat sekolah."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Lokasi */}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={fetchLocation}>
          <UploadCloud className="w-4 h-4 mr-2" /> Gunakan Lokasi Saya
        </Button>
        <Button variant="outline" onClick={() => setUseMap((prev) => !prev)}>
          Pilih di Peta 🗺️
        </Button>
      </div>

      {useMap && (
        <div className="h-96 w-full">
          <DynamicMap location={location} setLocation={setLocation} />
        </div>
      )}

      {location && (
        <p className="text-sm text-muted-foreground">
          <MapPin className="inline w-4 h-4 mr-1" />
          Lokasi: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </p>
      )}

      {/* Verifikasi */}
      <Button
        type="button"
        disabled={!image || loadingVerify}
        onClick={handleSubmit(onVerify)}
        className="w-full"
      >
        {loadingVerify ? (
          <>
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
            Verifikasi...
          </>
        ) : (
          <>
            <Check className="w-4 h-4 mr-2" />
            Verifikasi Gambar
          </>
        )}
      </Button>

      {/* Hasil Verifikasi */}
      {verified && (
        <div className="bg-muted rounded-md p-4 text-sm">
          <p>
            <strong>Jenis Sampah:</strong> {verified.wasteType}
          </p>
          <p>
            <strong>Jumlah Estimasi:</strong> {verified.quantity}
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            {(verified.confidence * 100).toFixed(1)}%
          </p>
          <p>
            <strong>Tingkat Urgensi:</strong> {verified.urgency}
          </p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="button"
        disabled={!verified || loadingSubmit}
        onClick={handleSubmit(onSubmit)}
        className="w-full"
      >
        {loadingSubmit ? (
          <>
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
            Mengirim...
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4 mr-2" />
            Kirim Laporan
          </>
        )}
      </Button>
    </div>
  );
}
