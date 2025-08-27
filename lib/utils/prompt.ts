export const buildPrompt = (
  description: string,
  location: { lat: number; lng: number }
): string => {
  return `
   Gambar ini dikirim oleh pengguna untuk pelaporan sampah.
   
   Berikut data tambahan:
   - Deskripsi pengguna: "${description}"
   - Lokasi: Latitude ${location.lat}, Longitude ${location.lng}
   
   Tugas Anda:
   1. Tentukan apakah gambar tersebut mengandung sampah.
   2. Jika ya, berikan output JSON dengan struktur berikut:
   
   {
     "isWaste": true,
     "wasteType": "plastik / organik / logam / ...",
     "quantity": "3 kg / 0.2 kg",
     "confidence": 0.85,
     "urgency": "tinggi / sedang / rendah"
   }
   
   Tingkat urgensi ditentukan berdasarkan jenis sampah, jumlah, dan deskripsi user.  
   Jika gambar tidak menunjukkan sampah, balas:
   
   {
     "isWaste": false,
     "message": "Gambar tidak menunjukkan sampah"
   }
   
   Kembalikan hanya JSON tanpa penjelasan tambahan.
     `.trim();
};
