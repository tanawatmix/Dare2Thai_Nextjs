"use client";

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { Icon, LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useState, useEffect, useRef } from 'react';

// Import geosearch
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// --- (Icon Fix - เหมือนเดิม) ---
const defaultIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Component ย่อยสำหรับ Marker ---
function DraggableMarker({ position, onPositionChange }: {
    position: LatLngExpression,
    onPositionChange: (lat: number, lng: number) => void
}) {
    const markerRef = useRef<L.Marker | null>(null);

    // ใช้ useMapEvents เพื่อรับการคลิกบนแผนที่
    useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return (
        <Marker
            position={position}
            icon={defaultIcon}
            draggable={true}
            eventHandlers={{
                dragend: () => {
                    const marker = markerRef.current;
                    if (marker != null) {
                        const newPos = marker.getLatLng();
                        onPositionChange(newPos.lat, newPos.lng);
                    }
                },
            }}
            ref={markerRef}
        />
    );
}

// --- Component ย่อยสำหรับอัปเดต View ---
function MapViewUpdater({ center, zoom }: { center: LatLngExpression, zoom: number }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom); // สั่งให้แผนที่ "บิน" ไปที่พิกัดใหม่
    }, [center, zoom, map]);
    return null;
}

// --- Component ย่อยสำหรับเพิ่มกล่องค้นหา ---
const SearchField = ({ onLocationFound }: { 
    onLocationFound: (lat: number, lng: number) => void 
}) => {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider();
        const searchControl = new (GeoSearchControl as any)({
            provider: provider,
            style: 'bar', // รูปแบบของกล่องค้นหา
            autoClose: true,
            keepResult: true,
        });
        
        map.addControl(searchControl);

        // "ฟัง" Event เมื่อค้นหาเจอ
        map.on('geosearch/showlocation', (result: any) => {
            onLocationFound(result.location.y, result.location.x); // y คือ lat, x คือ lng
        });

        return () => { map.removeControl(searchControl) };
    }, [map, onLocationFound]);

    return null;
};


// --- Props ที่ Component นี้จะรับ ---
interface MapPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
  center: LatLngExpression; // พิกัดที่ต้องการให้แผนที่แสดง (สำหรับเลื่อนตามจังหวัด)
  markerPosition: LatLngExpression; // พิกัดของหมุด
}

// --- Main MapPicker Component ---
const MapPicker: React.FC<MapPickerProps> = ({ onLocationChange, center, markerPosition }) => {
    
    const handleLocationUpdate = (lat: number, lng: number) => {
        onLocationChange(lat, lng);
    };

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: '400px', width: '100%', borderRadius: '0.5rem', zIndex: 1 }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Component สำหรับอัปเดต View เมื่อ 'center' เปลี่ยน */}
            <MapViewUpdater center={center} zoom={13} />
            
            {/* Component สำหรับ Marker ที่ลากได้ */}
            <DraggableMarker position={markerPosition} onPositionChange={handleLocationUpdate} />

            {/* Component สำหรับกล่องค้นหา */}
            <SearchField onLocationFound={handleLocationUpdate} />
        </MapContainer>
    );
};

export default MapPicker;