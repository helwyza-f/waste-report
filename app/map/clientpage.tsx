"use client";

import dynamic from "next/dynamic";
import { Report } from "./types";

// Import MapClient tanpa SSR
const MapClient = dynamic(() => import("@/components/MapClient"), {
  ssr: false,
});

export default function MapClientWrapper({
  reports,
  currentUserId,
}: {
  reports: Report[];
  currentUserId: string;
}) {
  return <MapClient reports={reports} currentUserId={currentUserId} />;
}
