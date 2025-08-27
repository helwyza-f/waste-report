import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

type YoloPrediction = {
  label: string;
  confidence: number;
  bbox?: number[];
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, mime, description, location } = body;

    if (!image || !mime || !description || !location?.lat || !location?.lng) {
      return NextResponse.json(
        { error: "image, mime, description, dan location wajib diisi." },
        { status: 400 }
      );
    }

    // === 1) Kirim ke YOLO service ===

    // === 1) Kirim ke YOLO service ===
    const yoloResp = await fetch(process.env.YOLO_API_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image, // base64
        mime, // image/jpeg | image/png
        filename: "report.jpg",
      }),
      // @ts-expect-error
      timeout: 30000,
    });

    if (!yoloResp.ok) {
      const errText = await yoloResp.text().catch(() => "");
      return NextResponse.json(
        { error: `YOLO service error: ${errText || yoloResp.statusText}` },
        { status: 502 }
      );
    }

    const yoloJson = await yoloResp.json();
    const predictions: YoloPrediction[] = Array.isArray(yoloJson?.predictions)
      ? yoloJson.predictions
      : [];

    const top = predictions
      .slice()
      .sort((a, b) => b.confidence - a.confidence)[0];
    if (!top) {
      return NextResponse.json(
        { error: "Tidak terdeteksi objek sampah oleh model." },
        { status: 400 }
      );
    }

    // === 2) Panggil Gemini untuk estimasi quantity ===
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Anda adalah asisten verifikasi laporan sampah.

HASIL DETEKSI YOLO:
- Waste type: ${top.label}
- Confidence: ${top.confidence.toFixed(4)}

KONTEKS PENGGUNA:
- Deskripsi: "${description}"
- Lokasi: Latitude ${location.lat}, Longitude ${location.lng}

TUGAS:
1) Estimasikan quantity sampah dari konteks & gambar.
2) Gunakan satuan kilogram (kg).
3) Kembalikan HANYA JSON dengan struktur:
{ "quantity": 3.5 }

Catatan:
- quantity harus berupa number (bukan string, tanpa satuan).
`.trim();

    // Sertakan gambar ke Gemini
    const geminiRes = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mime,
          data: image, // base64 tanpa prefix
        },
      },
    ]);

    const raw = geminiRes.response.text();
    const cleaned = raw.replace(/```json|```/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "Respon Gemini tidak valid JSON." },
        { status: 400 }
      );
    }

    const quantity: number | undefined = parsed?.quantity;
    if (typeof quantity !== "number" || isNaN(quantity)) {
      return NextResponse.json(
        { error: "Gemini tidak mengembalikan quantity berupa number." },
        { status: 400 }
      );
    }

    // === 3) Tentukan urgency berdasarkan quantity ===
    let urgency: "Rendah" | "Sedang" | "Tinggi" = "Rendah";
    if (quantity >= 30) urgency = "Tinggi";
    else if (quantity >= 10) urgency = "Sedang";
    else urgency = "Rendah";

    // === 4) Response final ===
    return NextResponse.json({
      isWaste: true,
      wasteType: top.label.toUpperCase(), // dari YOLO
      confidence: top.confidence, // dari YOLO
      quantity, // langsung number
      urgency, // dihitung manual
      yoloPublicUrl: yoloJson?.public_url ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error_route: err?.message || "Terjadi kesalahan di server verify." },
      { status: 500 }
    );
  }
}
