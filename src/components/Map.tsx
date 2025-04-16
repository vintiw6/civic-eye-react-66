
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertCircle, Fire, ShieldAlert, Car, Cloud, HelpCircle } from "lucide-react";
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
  searchTerm?: string;
  highlightedAlertId?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "fire":
      return <Fire className="h-full w-full text-white" />;
    case "crime":
      return <ShieldAlert className="h-full w-full text-white" />;
    case "accident":
      return <Car className="h-full w-full text-white" />;
    case "weather":
      return <Cloud className="h-full w-full text-white" />;
    default:
      return <HelpCircle className="h-full w-full text-white" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "fire":
      return "bg-alert-fire";
    case "crime":
      return "bg-alert-crime";
    case "accident":
      return "bg-alert-accident";
    case "weather":
      return "bg-alert-weather";
    default:
      return "bg-alert-other";
  }
};

const Map: React.FC<MapProps> = ({
  alerts,
  center = [39.8283, -98.5795], // Center of USA
  zoom = 4,
  onMarkerClick,
  searchTerm = "",
  highlightedAlertId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  // Effect to update map when center/zoom props change
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setView(center, zoom);
    setCurrentCenter(center);
    setCurrentZoom(zoom);
  }, [center, zoom]);

  // Effect for highlighted alert
  useEffect(() => {
    if (!highlightedAlertId || !mapInstance.current) return;
    
    const highlightedAlert = alerts.find(alert => alert.id === highlightedAlertId);
    if (highlightedAlert) {
      const marker = markersRef.current[highlightedAlertId];
      
      // Set view to the highlighted marker and zoom in
      mapInstance.current.setView(
        [highlightedAlert.location.lat, highlightedAlert.location.lng], 
        12
      );
      
      // Open the popup for this marker
      if (marker) {
        marker.openPopup();
      }
    }
  }, [highlightedAlertId, alerts]);

  // Effect for search term
  useEffect(() => {
    if (!searchTerm || !mapInstance.current) return;
    
    const matchingAlerts = alerts.filter(alert => 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.description && alert.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      alert.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingAlerts.length > 0) {
      // Find bounds that contain all matching alerts
      if (matchingAlerts.length > 1) {
        const bounds = L.latLngBounds(
          matchingAlerts.map(alert => [alert.location.lat, alert.location.lng])
        );
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      } else {
        // Just one match, center on it
        const alert = matchingAlerts[0];
        mapInstance.current.setView(
          [alert.location.lat, alert.location.lng], 
          12
        );
        
        // Open the popup for this marker
        const marker = markersRef.current[alert.id];
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }, [searchTerm, alerts]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(currentCenter, currentZoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
      
      // Listen for map movement to update current position
      mapInstance.current.on('moveend', () => {
        if (!mapInstance.current) return;
        const center = mapInstance.current.getCenter();
        setCurrentCenter([center.lat, center.lng]);
        setCurrentZoom(mapInstance.current.getZoom());
      });
    } else {
      // If map already exists, just update view
      mapInstance.current.setView(currentCenter, currentZoom);
    }

    // Create custom icon function
    const createCustomIcon = (category: string, isHighlighted: boolean) => {
      const size = isHighlighted ? '40px' : '32px';
      const html = renderToString(
        <div className={`flex items-center justify-center rounded-full ${getCategoryColor(category)}`} 
             style={{width: size, height: size, boxShadow: '0 2px 5px rgba(0,0,0,0.3)'}}>
          {getCategoryIcon(category)}
        </div>
      );

      return L.divIcon({
        html,
        className: "custom-marker-icon",
        iconSize: isHighlighted ? [40, 40] : [32, 32],
        iconAnchor: isHighlighted ? [20, 20] : [16, 16],
      });
    };

    // Clear previous markers
    Object.values(markersRef.current).forEach(marker => {
      marker.remove();
    });
    markersRef.current = {};
    
    // Add markers for all alerts
    alerts.forEach(alert => {
      const isHighlighted = alert.id === highlightedAlertId;
      
      const marker = L.marker(
        [alert.location.lat, alert.location.lng],
        { icon: createCustomIcon(alert.category, isHighlighted) }
      ).addTo(mapInstance.current!);
      
      const popupContent = `
        <div class="p-2">
          <h3 class="font-bold text-sm">${alert.title}</h3>
          <p class="text-xs mt-1">${alert.location.address}</p>
          ${alert.description ? `<p class="text-xs mt-1 text-gray-600">${alert.description}</p>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(alert.id));
      }
      
      // Save reference to marker
      markersRef.current[alert.id] = marker;
      
      // If this is the highlighted marker, open its popup
      if (isHighlighted) {
        marker.openPopup();
      }
    });

    // Cleanup function
    return () => {
      // Clear markers when component unmounts
      Object.values(markersRef.current).forEach(marker => {
        marker.remove();
      });
      markersRef.current = {};
    };
  }, [alerts, currentCenter, currentZoom, highlightedAlertId, onMarkerClick]);

  return (
    <div className="map-container h-[600px] rounded-xl overflow-hidden border shadow-xl">
      <div ref={mapRef} className="h-full z-0"></div>
    </div>
  );
};

export default Map;
