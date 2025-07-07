"use client";

import dynamic from "next/dynamic";
import { Report } from "@/app/map/types";

// Import AdminMapClient tanpa SSR
const AdminMapClient = dynamic(() => import("./adminmapclient"), {
  ssr: false,
});

export default function Wrapper({ reports }: { reports: Report[] }) {
  return <AdminMapClient reports={reports} />;
}
