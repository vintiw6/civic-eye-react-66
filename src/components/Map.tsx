
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Alert } from "./AlertCard";
import { divIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import { AlertCircle } from "lucide-react";

// Fix for Leaflet marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";

// Fix default Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

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
  const createCustomIcon = (category: string) => {
    const html = renderToString(
      <div className={`marker-icon ${getCategoryColor(category)}`}>
        <AlertCircle className="h-8 w-8" />
      </div>
    );

    return divIcon({
      html,
      className: "custom-marker-icon",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.location.lat, alert.location.lng]}
            icon={createCustomIcon(alert.category)}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(alert.id),
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold">{alert.title}</h3>
                <p className="text-xs mt-1">{alert.location.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
