"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type User = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
};

export default function UsersClient({ users }: { users: User[] }) {
  const [data, setData] = useState(users);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const handleMakeAdmin = async (id: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", id);

    if (!error) {
      toast.success("Role berhasil diubah menjadi admin");
      setData((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: "admin" } : u))
      );
    } else {
      toast.error("Gagal mengubah role");
    }
  };

  const filteredUsers = data.filter((user) => {
    const fullName = `${user.first_name || ""} ${
      user.last_name || ""
    }`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      <h1 className="text-2xl font-bold">👥 Manajemen Pengguna</h1>

      <Input
        placeholder="Cari nama pengguna..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-x-auto border rounded-md mt-4">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Nama</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="text-center py-4 text-muted-foreground"
                >
                  Tidak ada user ditemukan.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="p-2">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="p-2 capitalize">{user.role || "user"}</td>
                  <td className="p-2 text-center">
                    {user.role === "admin" ? (
                      <span className="text-muted-foreground text-xs">
                        Admin
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleMakeAdmin(user.id)}
                      >
                        Jadikan Admin
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
