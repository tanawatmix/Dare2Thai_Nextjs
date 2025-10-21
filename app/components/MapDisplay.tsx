"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet/dist/leaflet.css"; // Import CSS ของ Leaflet
import { Icon, LatLngExpression } from 'leaflet';
import L from 'leaflet'; // Import L

// --- แก้ไขปัญหา Icon ของ Marker ไม่แสดง ---
// (จำเป็นต้องมีไฟล์เหล่านี้ในโฟลเดอร์ /public/images/ หรือใช้ URL จาก CDN)
const defaultIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Hack เพื่อให้ Icon ทำงานถูกต้องใน Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
// --- สิ้นสุดการแก้ไข Icon ---


// Props ที่ Component นี้จะรับ
interface MapDisplayProps {
  latitude: number;
  longitude: number;
  postTitle?: string; // (Optional) เพิ่ม title เพื่อแสดงใน Popup
}

const MapDisplay: React.FC<MapDisplayProps> = ({ latitude, longitude, postTitle }) => {
    
    // ตรวจสอบว่ามีค่าพิกัดที่ถูกต้องหรือไม่
    if (!latitude || !longitude) {
        return <div className="text-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">ไม่พบข้อมูลพิกัด</div>;
    }

    const position: LatLngExpression = [latitude, longitude];

    return (
        <MapContainer
            center={position}
            zoom={15} // ซูมเข้าไปใกล้ๆ ตำแหน่งที่ปักหมุด
            style={{ height: '300px', width: '100%', borderRadius: '1rem', zIndex: 0 }} // zIndex: 0
            scrollWheelZoom={false} // ปิดการซูมด้วย scroll (เหมาะสำหรับการแสดงผล)
            touchZoom={false}
            dragging={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={defaultIcon}>
                {postTitle && (
                    <Popup>
                        <span className="font-bold">{postTitle}</span>
                    </Popup>
                )}
            </Marker>
        </MapContainer>
    );
};

export default MapDisplay;