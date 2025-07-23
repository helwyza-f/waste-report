"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function ProfileClient({ profile }: { profile: any }) {
  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-4">
      <h1 className="text-2xl font-bold">👤 Profil Saya</h1>

      <Card className="p-4 space-y-2">
        {profile.avatar_url && (
          <Image
            src={profile.avatar_url}
            alt="Avatar"
            width={96}
            height={96}
            className="rounded-full"
          />
        )}
        <p>
          <strong>Nama:</strong> {profile.first_name} {profile.last_name}
        </p>
        <p>
          <strong>Alamat:</strong> {profile.address || "-"}
        </p>
        <p>
          <strong>No. HP:</strong> {profile.phone || "-"}
        </p>
        <p>
          <strong>Role:</strong> {profile.role}
        </p>

        <Button asChild className="mt-4">
          <Link href="/profile/edit">Edit Profil</Link>
        </Button>
      </Card>
    </div>
  );
}
