"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Report } from "@/app/(routes)/map/types";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Dynamic Leaflet import
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), {
  ssr: false,
});

// Emoji marker icon
const createEmojiIcon = (emoji: string) =>
  new L.DivIcon({
    className: "emoji-marker",
    html: `<div style="font-size: 20px;">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

const icons = {
  pending: createEmojiIcon("⏳"),
  done: createEmojiIcon("✅"),
};

export default function AdminMapClient({ reports }: { reports: Report[] }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const parsedReports = useMemo(() => {
    return reports
      .map((r) => {
        if (!r.location) return null;
        const [lat, lng] = r.location
          .replace(/[()]/g, "")
          .split(",")
          .map(Number);
        return { ...r, lat, lng };
      })
      .filter(Boolean) as (Report & { lat: number; lng: number })[];
  }, [reports]);

  const filteredReports = useMemo(() => {
    return parsedReports.filter((r) => {
      const statusOk = statusFilter === "all" || r.status === statusFilter;
      const urgencyOk = urgencyFilter === "all" || r.urgency === urgencyFilter;
      return statusOk && urgencyOk;
    });
  }, [parsedReports, statusFilter, urgencyFilter]);

  const center = filteredReports[0] || { lat: 1.1221, lng: 104.0531 };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🗺️ Peta Laporan (Admin)</h1>

        <div className="flex flex-wrap gap-3 items-center justify-end relative z-[100]">
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                ⏰{" "}
                {
                  { all: "Semua Status", pending: "Pending", done: "Selesai" }[
                    statusFilter
                  ]
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[999] fixed">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Semua Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("done")}>
                Selesai
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Urgency Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                ⚠️{" "}
                {
                  {
                    all: "Semua Urgensi",
                    tinggi: "Tinggi",
                    sedang: "Sedang",
                    rendah: "Rendah",
                  }[urgencyFilter]
                }
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[999] fixed">
              <DropdownMenuItem onClick={() => setUrgencyFilter("all")}>
                Semua Urgensi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUrgencyFilter("tinggi")}>
                Tinggi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUrgencyFilter("sedang")}>
                Sedang
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setUrgencyFilter("rendah")}>
                Rendah
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Map */}
      <div className="h-[80vh] w-full rounded-md overflow-hidden">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredReports.map((r) => (
            <Marker
              key={r.id}
              position={[r.lat, r.lng]}
              icon={icons[r.status === "done" ? "done" : "pending"]}
            >
              <Popup minWidth={220}>
                <div className="text-sm space-y-2">
                  {r.image_url && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${r.image_url}`}
                      alt="preview"
                      className="w-full rounded"
                      width={200}
                      height={100}
                    />
                  )}
                  <p>
                    <strong>🧾 Deskripsi:</strong>{" "}
                    {r.description || "Tidak ada"}
                  </p>
                  <p>
                    <strong>📍 Lokasi:</strong> {r.lat.toFixed(4)},{" "}
                    {r.lng.toFixed(4)}
                  </p>
                  <p>
                    <strong>⏰ Status:</strong> {r.status}
                  </p>
                  <p>
                    <strong>⚠️ Urgensi:</strong> {r.urgency}
                  </p>
                  <Link
                    href={`/admin/reports/${r.id}`}
                    className="block mt-2 text-sm text-blue-500 underline"
                  >
                    🔧 Kelola laporan ini
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
