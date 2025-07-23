"use client";

import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Profile } from "@/types/profile";

export default function EditProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      address: profile.address || "",
      phone: profile.phone || "",
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", profile.id);

    setLoading(false);
    if (error) {
      toast.error("Gagal memperbarui profil");
    } else {
      toast.success("Profil berhasil diperbarui");
      router.push("/profile");
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">✏️ Edit Profil</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Nama Depan</Label>
          <Input {...register("first_name")} />
        </div>
        <div>
          <Label>Nama Belakang</Label>
          <Input {...register("last_name")} />
        </div>
        <div>
          <Label>Alamat</Label>
          <Input {...register("address")} />
        </div>
        <div>
          <Label>No. HP</Label>
          <Input {...register("phone")} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
          <Button variant="outline" onClick={() => router.push("/profile")}>
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
