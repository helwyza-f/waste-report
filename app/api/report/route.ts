import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string;
    const lat = formData.get("lat") as string;
    const lng = formData.get("lng") as string;
    const description = formData.get("description") as string;
    const wasteType = formData.get("wasteType") as string;
    const quantity = formData.get("quantity") as string;
    const confidence = formData.get("confidence") as string;
    const urgency = formData.get("urgency") as string;

    if (
      !file ||
      !userId ||
      !lat ||
      !lng ||
      !description ||
      !wasteType ||
      !quantity ||
      !confidence ||
      !urgency
    ) {
      return NextResponse.json(
        { error: "Semua data wajib diisi." },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const filePath = `reports/${userId}-${timestamp}-${file.name}`;

    // Upload ke Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("report-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal upload gambar." },
        { status: 500 }
      );
    }

    // Simpan ke database
    const { error: insertError } = await supabase.from("reports").insert({
      user_id: userId,
      image_url: uploadData.path,
      location: `(${lat},${lng})`,
      description,
      waste_type: wasteType,
      quantity,
      confidence: parseFloat(confidence),
      urgency,
      status: "pending",
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "Gagal menyimpan laporan." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengirim laporan." },
      { status: 500 }
    );
  }
}
