"use client";

import { Report } from "@/app/(routes)/map/types";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function ReportsClient({ reports }: { reports: Report[] }) {
  const [data, setData] = useState(reports);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const supabase = createClient();

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setData((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      toast.success("Status diperbarui!");
    } else {
      toast.error("Gagal mengubah status.");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (!error) {
      setData((prev) => prev.filter((r) => r.id !== id));
      toast.success("Laporan dihapus.");
    } else {
      toast.error("Gagal menghapus laporan.");
    }
  };

  const resetFilters = () => {
    setStatusFilter("all");
    setUrgencyFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const filteredData = data.filter((r) => {
    const statusOk = statusFilter === "all" || r.status === statusFilter;
    const urgencyOk = urgencyFilter === "all" || r.urgency === urgencyFilter;

    const created = r.created_at ? new Date(r.created_at) : null;
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const dateOk =
      (!start || (created && created >= start)) &&
      (!end || (created && created <= end));

    return statusOk && urgencyOk && dateOk;
  });

  function convertToCSV(data: Report[]) {
    const headers = [
      "id",
      "description",
      "location",
      "urgency",
      "status",
      "created_at",
    ];
    const rows = data.map((r) => [
      r.id,
      `"${r.description?.replace(/"/g, '""') || ""}"`,
      r.location || "",
      r.urgency || "",
      r.status || "",
      r.created_at || "",
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    return csvContent;
  }

  const handleExportCSV = () => {
    const csv = convertToCSV(filteredData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "laporan-sampah.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map((r) => ({
      ID: r.id,
      Deskripsi: r.description || "",
      Lokasi: r.location || "",
      Urgensi: r.urgency || "",
      Status: r.status || "",
      "Waktu Lapor": r.created_at
        ? format(new Date(r.created_at), "dd MMM yyyy, HH:mm")
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

    XLSX.writeFile(workbook, "laporan.xlsx");
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-3 space-y-6 min-h-screen mb-80">
      <h1 className="text-2xl font-bold">📋 Manajemen Laporan</h1>

      {/* Filter Mobile - Sticky Collapsible */}
      <div className="md:hidden sticky top-[61px] z-50 bg-background shadow-md">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <div className="flex justify-between items-center py-4">
            <span className="font-medium text-base px-2">
              🔍 Filter & Export
            </span>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-3 px-2 pb-4">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="z-50">
                    ⏳ Status: {statusFilter === "all" ? "Semua" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-50">
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    Semua
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("done")}>
                    Selesai
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Urgency */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="z-50">
                    ⚠️ Urgensi:{" "}
                    {urgencyFilter === "all" ? "Semua" : urgencyFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-50">
                  <DropdownMenuItem onClick={() => setUrgencyFilter("all")}>
                    Semua
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

              {/* Date Range */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">Dari</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 w-[140px]"
                />
                <label className="text-sm text-muted-foreground">s/d</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 w-[140px]"
                />
              </div>

              <Button
                variant="secondary"
                className="text-sm"
                onClick={resetFilters}
              >
                🔄 Reset
              </Button>
              <Button
                variant="secondary"
                className="text-sm"
                onClick={handleExportCSV}
              >
                📥 Export CSV
              </Button>
              <Button
                variant="secondary"
                className="text-sm"
                onClick={handleExportExcel}
              >
                📊 Export Excel
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Filter Desktop - Sticky */}
      <div className="hidden md:block sticky top-[57px] z-40 bg-background shadow-sm py-4">
        <div className="flex flex-wrap gap-3 items-center ">
          {/* Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="z-50">
                ⏳ Status: {statusFilter === "all" ? "Semua" : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                Semua
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("done")}>
                Selesai
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Urgency */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="z-50">
                ⚠️ Urgensi: {urgencyFilter === "all" ? "Semua" : urgencyFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-50">
              <DropdownMenuItem onClick={() => setUrgencyFilter("all")}>
                Semua
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

          {/* Date */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Dari</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-[140px]"
            />
            <label className="text-sm text-muted-foreground">s/d</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-[140px]"
            />
          </div>

          <Button
            variant="secondary"
            className="text-sm"
            onClick={resetFilters}
          >
            🔄 Reset
          </Button>
          <Button
            variant="secondary"
            className="text-sm"
            onClick={handleExportCSV}
          >
            📥 Export CSV
          </Button>
          <Button
            variant="secondary"
            className="text-sm"
            onClick={handleExportExcel}
          >
            📊 Export Excel
          </Button>
        </div>
      </div>

      {/* Tabel Desktop */}
      <div className="overflow-x-auto border rounded-md hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Gambar</th>
              <th className="p-2 text-left">Deskripsi</th>
              <th className="p-2">Lokasi</th>
              <th className="p-2">Urgensi</th>
              <th className="p-2">Status</th>
              <th className="p-2">Waktu</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">
                  {r.image_url && (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${r.image_url}`}
                      alt="preview"
                      width={64}
                      height={64}
                      className="rounded object-cover h-16 w-16"
                    />
                  )}
                </td>
                <td className="p-2">{r.description}</td>
                <td className="p-2 text-center">{r.location}</td>
                <td className="p-2 text-center capitalize">{r.urgency}</td>
                <td className="p-2 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {r.status}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(r.id, "pending")}
                      >
                        ⏳ Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(r.id, "done")}
                      >
                        ✅ Selesai
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
                <td className="p-2 text-center">
                  {r.created_at
                    ? format(new Date(r.created_at), "dd MMM yyyy, HH:mm")
                    : "-"}
                </td>
                <td className="p-2">
                  <div className="flex items-center justify-center gap-2">
                    <Button asChild size="sm" variant="outline">
                      <a href={`/admin/reports/${r.id}`}>Detail</a>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(r.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card List Mobile */}
      <div className="md:hidden space-y-4">
        {filteredData.map((r) => (
          <div
            key={r.id}
            className="border rounded-md p-4 space-y-3 bg-white shadow-sm"
          >
            <div className="flex items-start gap-3">
              {r.image_url && (
                <Image
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/report-images/${r.image_url}`}
                  alt="preview"
                  width={64}
                  height={64}
                  className="rounded object-cover h-16 w-16"
                />
              )}
              <div className="flex-1 text-sm space-y-1">
                <p>
                  <strong>📍 Lokasi:</strong> {r.location}
                </p>
                <p>
                  <strong>🧾 Deskripsi:</strong> {r.description}
                </p>
                <p>
                  <strong>⚠️ Urgensi:</strong> {r.urgency}
                </p>
                <p>
                  <strong>⏰ Waktu:</strong>{" "}
                  {r.created_at
                    ? format(new Date(r.created_at), "dd MMM yyyy, HH:mm")
                    : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Status */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Status: {r.status}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(r.id, "pending")}
                  >
                    ⏳ Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusChange(r.id, "done")}
                  >
                    ✅ Selesai
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <a href={`/admin/reports/${r.id}`}>Detail</a>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(r.id)}
                >
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Floating Filter Toggle (Mobile Only) */}
      {/* <div className="md:hidden fixed bottom-5 right-5 z-50">
        <Button
          className="rounded-full shadow-lg"
          onClick={() => setIsFilterOpen((prev) => !prev)}
          variant="default"
          size="icon"
        >
          {isFilterOpen ? "❌" : "🔍"}
        </Button>
      </div> */}
    </div>
  );
}
