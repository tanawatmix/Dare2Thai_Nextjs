"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngExpression } from "leaflet";
import { useEffect, useState } from "react";

// Icon ของ Marker
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapDisplayProps {
  latitude?: number;
  longitude?: number;
  postTitle?: string;
}

interface RecenterMapProps {
  position: [number, number];
}
const RecenterMap: React.FC<RecenterMapProps> = ({ position }) => {
  const map = useMap();
  useEffect(() => { 
    map.setView(position, map.getZoom());
  }, [map, position]);
  return null;
};

const MapDisplay: React.FC<MapDisplayProps> = ({
  latitude,
  longitude,
  postTitle,
}) => {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  );
  
  const defaultPosition: [number, number] = [13.7563, 100.5018];

  useEffect(() => {
    if (!latitude && !longitude && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.error("ไม่สามารถเข้าถึงตำแหน่งปัจจุบัน:", err);
          setPosition(defaultPosition); 
        }
      );
    } else if (latitude && longitude) {
        setPosition([latitude, longitude]);
    } else {
        setPosition(defaultPosition); 
    }
  }, [latitude, longitude]); 

  if (!position) {
    return (
      <div className="text-center p-4 h-[300px] w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
        กำลังโหลดแผนที่...
      </div>
    );
  }

  const [lat, lng] = position;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`; 

  return (
    <MapContainer
      center={position as LatLngExpression}
      zoom={15}
      style={{ height: "300px", width: "100%", borderRadius: "1rem", zIndex: 0 }} 
      scrollWheelZoom={false}
      touchZoom={false}
      dragging={false}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap position={position} />
      <Marker position={position as LatLngExpression} icon={defaultIcon}>
        <Popup>
          <div className="flex flex-col gap-2">
            {postTitle && <span className="font-bold">{postTitle}</span>}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              เปิดใน Google Maps
            </a>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapDisplay;