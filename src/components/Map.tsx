
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertCircle } from "lucide-react";
import { renderToString } from "react-dom/server";

// Fix for Leaflet marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

// Alert interface
export interface Alert {
  id: string;
  title: string;
  description?: string;
  category: "fire" | "crime" | "accident" | "weather" | "other";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  imageUrl?: string;
  createdAt?: any;
  createdBy?: any;
}

interface MapProps {
  alerts: Alert[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (alertId: string) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "fire":
      return "text-alert-fire";
    case "crime":
      return "text-alert-crime";
    case "accident":
      return "text-alert-accident";
    case "weather":
      return "text-alert-weather";
    default:
      return "text-alert-other";
  }
};

const Map: React.FC<MapProps> = ({
  alerts,
  center = [39.8283, -98.5795], // Center of USA
  zoom = 4,
  onMarkerClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    } else {
      // If map already exists, just update view
      mapInstance.current.setView(center, zoom);
    }

    // Create custom icon function
    const createCustomIcon = (category: string) => {
      const html = renderToString(
        <div className={`marker-icon ${getCategoryColor(category)}`}>
          <AlertCircle className="h-8 w-8" />
        </div>
      );

      return L.divIcon({
        html,
        className: "custom-marker-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
    };

    // Add markers for all alerts
    const markers: L.Marker[] = [];
    
    alerts.forEach(alert => {
      const marker = L.marker(
        [alert.location.lat, alert.location.lng],
        { icon: createCustomIcon(alert.category) }
      ).addTo(mapInstance.current!);
      
      marker.bindPopup(`
        <div class="text-sm">
          <h3 class="font-bold">${alert.title}</h3>
          <p class="text-xs mt-1">${alert.location.address}</p>
        </div>
      `);
      
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(alert.id));
      }
      
      markers.push(marker);
    });

    // Cleanup function
    return () => {
      // Remove all markers when component unmounts or updates
      markers.forEach(marker => {
        marker.remove();
      });
    };
  }, [alerts, center, zoom, onMarkerClick]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="h-full z-0"></div>
    </div>
  );
};

export default Map;
