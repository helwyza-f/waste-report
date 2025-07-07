import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image, mime, prompt } = body;

    // Validasi input
    if (!image || !mime || !prompt) {
      return NextResponse.json(
        { error: "Gambar, mime type, dan prompt wajib diisi." },
        { status: 400 }
      );
    }

    // Inisialisasi Gemini
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Kirim prompt + gambar ke Gemini
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mime,
          data: image,
        },
      },
    ]);

    const rawText = result.response.text();
    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (err) {
      return NextResponse.json(
        { error: "Respon AI tidak dapat diparse sebagai JSON." },
        { status: 400 }
      );
    }

    if (!parsed.isWaste) {
      return NextResponse.json(
        { error: parsed.message || "Gambar tidak menunjukkan sampah." },
        { status: 400 }
      );
    }

    const { wasteType, quantity, confidence, urgency } = parsed;

    // Validasi field
    if (!wasteType || !quantity || typeof confidence !== "number" || !urgency) {
      return NextResponse.json(
        { error: "Respon AI tidak lengkap atau format tidak sesuai." },
        { status: 400 }
      );
    }

    // Validasi confidence threshold
    if (confidence < 0.6) {
      return NextResponse.json(
        {
          error: `Confidence terlalu rendah (${(confidence * 100).toFixed(
            1
          )}%). Gunakan gambar yang lebih jelas.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ wasteType, quantity, confidence, urgency });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Terjadi kesalahan saat proses verifikasi." },
      { status: 500 }
    );
  }
}
