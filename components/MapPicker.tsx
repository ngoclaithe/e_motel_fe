"use client";

import { useEffect, useRef, useState } from "react";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onSelect: (lat: number, lng: number) => void;
}

export function MapPicker({ latitude, longitude, onSelect }: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Record<string, unknown> | null>(null);
  const marker = useRef<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      try {
        // Load Leaflet CSS and JS from CDN
        if (!window.L) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
          document.head.appendChild(link);

          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
          script.onload = () => {
            initializeMap();
          };
          document.head.appendChild(script);
        } else {
          initializeMap();
        }
      } catch (error) {
        console.error("Error loading Leaflet:", error);
        setIsLoading(false);
      }
    };

    const initializeMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainer.current || map.current) return;

      const initialLat = latitude || 10.7769;
      const initialLng = longitude || 106.6966;

      map.current = L.map(mapContainer.current).setView([initialLat, initialLng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map.current);

      if (latitude && longitude) {
        marker.current = L.marker([latitude, longitude]).addTo(map.current);
      }

      map.current.on("click", (e: Record<string, unknown>) => {
        const { lat, lng } = e.latlng;

        if (marker.current) {
          marker.current.setLatLng([lat, lng]);
        } else {
          marker.current = L.marker([lat, lng]).addTo(map.current);
        }

        onSelect(lat, lng);
      });

      setIsLoading(false);
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div
        ref={mapContainer}
        className="w-full rounded-lg border border-black/10 dark:border-white/15"
        style={{ height: "300px", position: "relative" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Đang tải bản đồ...</div>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Nhấp vào bản đ�� để chọn vị trí. Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </p>
    </div>
  );
}
