import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address: string;
  className?: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ latitude, longitude, address, className = '' }) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize map if it hasn't been initialized yet
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    // Create map instance
    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 13);
    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    const marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(`<b>${address}</b>`).openPopup();

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, address]);

  // Update map view when coordinates change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([latitude, longitude], 13);
    }
  }, [latitude, longitude]);

  return (
    <div className={className}>
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[300px] rounded-lg overflow-hidden border"
        style={{ zIndex: 0 }}
      />
    </div>
  );
};

export default PropertyMap;
