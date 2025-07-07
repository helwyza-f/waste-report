"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
interface Location {
  lat: number;
  lng: number;
}

// 🔥 Custom Icon untuk Marker
const customIcon = new L.Icon({
  iconUrl: "/marker.png", // Ganti dengan path ikon yang diinginkan
  iconSize: [35, 35], // Ukuran ikon
  iconAnchor: [17, 35], // Posisi anchor ikon
  popupAnchor: [0, -35], // Posisi popup relatif ke ikon
});

type Props = {
  location: Location | null;
  setLocation: (loc: Location) => void;
};

export default function DynamicMap({ location, setLocation }: Props) {
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });
    return null;
  };

  console.log(location);

  return (
    <MapContainer
      center={location || { lat: 1.1221873058442657, lng: 104.0531944079747 }}
      zoom={13}
      className="h-full w-full z-0"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler />
      {location && <Marker position={location} icon={customIcon} />}
    </MapContainer>
  );
}
