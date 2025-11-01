"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { Icon, LatLngExpression } from "leaflet";
import L from "leaflet";
import { useState, useEffect, useRef } from "react";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

const customIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 45],
  iconAnchor: [17, 45],
});

function DraggableMarker({
  position,
  onPositionChange,
}: {
  position: LatLngExpression;
  onPositionChange: (lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      position={position}
      icon={customIcon}
      draggable
      ref={(ref) => {
        markerRef.current = ref ?? null;
      }}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker) {
            const newPos = marker.getLatLng();
            onPositionChange(newPos.lat, newPos.lng);
          }
        },
      }}
    />
  );
}

function MapViewUpdater({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const SearchField = ({
  onLocationFound,
}: {
  onLocationFound: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new (GeoSearchControl as any)({
      provider,
      style: "bar",
      autoClose: true,
      keepResult: true,
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result: any) => {
      onLocationFound(result.location.y, result.location.x);
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onLocationFound]);

  return null;
};
const LocateButton = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    const handleLocate = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            map.flyTo([latitude, longitude], 15);
            onLocate(latitude, longitude);
          },
          (err) => console.warn("ไม่สามารถเข้าถึงตำแหน่งได้:", err)
        );
      }
    };

    const locateControl = new (L.Control as any)({ position: "bottomright" });
    locateControl.onAdd = () => {
      const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
      div.style.cursor = "pointer";
      div.style.padding = "6px 10px";
      div.style.background = "white";
      div.style.borderRadius = "4px";
      div.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
      div.innerText = "📍 ตำแหน่งปัจจุบัน";

      div.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleLocate();
      };

      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      return div;
    };

    locateControl.addTo(map);
    return () => locateControl.remove();
  }, [map, onLocate]);

  return null;
};

interface MapPickerProps {
  onLocationChange: (lat: number, lng: number) => void;
  center: LatLngExpression;
  markerPosition: LatLngExpression;
}

const MapPicker: React.FC<MapPickerProps> = ({
  onLocationChange,
  center,
  markerPosition,
}) => {
  const [currentMarker, setCurrentMarker] =
    useState<LatLngExpression>(markerPosition);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>(center);

  const handleMarkerChange = (lat: number, lng: number) => {
    setCurrentMarker([lat, lng]);
    setMapCenter([lat, lng]);
    onLocationChange(lat, lng);
  };

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewUpdater center={mapCenter} zoom={13} />
      <DraggableMarker
        position={currentMarker}
        onPositionChange={handleMarkerChange}
      />
      <SearchField onLocationFound={handleMarkerChange} />
      <LocateButton onLocate={handleMarkerChange} />
    </MapContainer>
  );
};

export default MapPicker;