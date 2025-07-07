// types/profile.ts
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at?: string; // opsional jika ada
};
