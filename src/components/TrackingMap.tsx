/**
 * AirPak Express - Tracking Map Component
 * MapLibre GL JS with Apple Maps-style UI (fallback when MapKit unavailable)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShipmentStore } from '../store';
import { MAPLIBRE_STYLE_URL, DEFAULT_CENTER, DEFAULT_ZOOM, MAP_COLORS, PIN_CONFIG, CAMERA_CONFIG } from '../config/maps';
import {
  Search, X, Plus, Minus, Navigation, Share2, Printer,
  Clock, MapPin, CheckCircle, Truck, ChevronRight, Layers
} from 'lucide-react';

// MapLibre GL types
declare global {
  interface Window {
    maplibregl: any;
  }
}

interface TrackingMapProps {
  trackingNumber?: string;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  className?: string;
}

interface MapPin {
  id: string;
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'current' | 'waypoint';
  label?: string;
  timestamp?: Date;
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  trackingNumber,
  onLocationSelect,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  const { selectedShipment } = useShipmentStore();

  // Generate pins from shipment data
  const generatePins = useCallback((): MapPin[] => {
    if (!selectedShipment) return [];

    const pins: MapPin[] = [];

    // Origin pin
    pins.push({
      id: 'origin',
      lat: selectedShipment.origin.lat,
      lng: selectedShipment.origin.lng,
      type: 'origin',
      label: selectedShipment.origin.city,
    });

    // Destination pin
    pins.push({
      id: 'destination',
      lat: selectedShipment.destination.lat,
      lng: selectedShipment.destination.lng,
      type: 'destination',
      label: selectedShipment.destination.city,
    });

    // Current location pin
    if (selectedShipment.current_location) {
      pins.push({
        id: 'current',
        lat: selectedShipment.current_location.lat,
        lng: selectedShipment.current_location.lng,
        type: 'current',
        label: 'Current Location',
        timestamp: selectedShipment.current_location.timestamp,
      });
    }

    return pins;
  }, [selectedShipment]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initMap = async () => {
      // Load MapLibre GL JS
      if (!window.maplibregl) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/maplibre-gl@4.1.0/dist/maplibre-gl.js';
        script.onload = () => initializeMap();
        document.head.appendChild(script);

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@4.1.0/dist/maplibre-gl.css';
        document.head.appendChild(link);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      map.current = new window.maplibregl.Map({
        container: mapContainer.current!,
        style: MAPLIBRE_STYLE_URL,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.current.addControl(
        new window.maplibregl.AttributionControl({ compact: true }),
        'bottom-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
        addPins(generatePins());
      });

      map.current.on('zoom', () => {
        setZoom(map.current.getZoom());
      });
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update pins when shipment changes
  useEffect(() => {
    if (mapLoaded && selectedShipment) {
      addPins(generatePins());

      // Fly to current location
      if (selectedShipment.current_location) {
        map.current.flyTo({
          center: [selectedShipment.current_location.lng, selectedShipment.current_location.lat],
          speed: CAMERA_CONFIG.flySpeed,
          curve: CAMERA_CONFIG.flyCurve,
          essential: true,
        });
      }
    }
  }, [selectedShipment, mapLoaded, generatePins]);

  // Add pins to map
  const addPins = (pins: MapPin[]) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    pins.forEach(pin => {
      const config = PIN_CONFIG[pin.type];

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-map-pin';
      el.innerHTML = `
        <div class="relative">
          <svg width="40" height="48" viewBox="0 0 40 48" fill="none">
            <path d="M20 0C8.954 0 0 8.954 0 20c0 16 20 28 20 28s20-12 20-28C40 8.954 31.046 0 20 0z" fill="${config.color}"/>
            <circle cx="20" cy="18" r="8" fill="white"/>
            ${pin.type === 'current' ? `<circle cx="20" cy="18" r="4" fill="${config.color}"/>` : ''}
          </svg>
          ${pin.type === 'current' ? `
            <div class="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div class="w-6 h-6 rounded-full animate-ping opacity-50" style="background: ${config.color};"></div>
            </div>
          ` : ''}
        </div>
      `;
      el.style.cursor = 'pointer';
      el.style.transform = 'translate(-50%, -100%)';

      // Pulse animation for current location
      if (pin.type === 'current') {
        el.querySelector('svg')?.classList.add('animate-pulse-marker');
      }

      const marker = new window.maplibregl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .setPopup(
          new window.maplibregl.Popup({ offset: 25, closeButton: false })
            .setHTML(`
              <div class="p-2">
                <div class="font-semibold">${pin.label}</div>
                ${pin.timestamp ? `<div class="text-xs text-gray-500">${new Date(pin.timestamp).toLocaleString()}</div>` : ''}
              </div>
            `)
        )
        .addTo(map.current);

      el.addEventListener('click', () => {
        onLocationSelect?.({ lat: pin.lat, lng: pin.lng });
      });

      markersRef.current.push(marker);
    });

    // Draw route line if we have origin and destination
    if (pins.length >= 2) {
      drawRoute(pins);
    }
  };

  // Draw route line
  const drawRoute = (pins: MapPin[]) => {
    const sourceId = 'route';
    const layerId = 'route-line';

    // Remove existing route
    if (map.current.getSource(sourceId)) {
      map.current.removeLayer(layerId);
      map.current.removeSource(sourceId);
    }

    // Create route coordinates
    const coordinates = pins
      .sort((a, b) => {
        if (a.type === 'origin') return -1;
        if (b.type === 'origin') return 1;
        if (a.type === 'current') return -1;
        if (b.type === 'current') return 1;
        if (a.type === 'destination') return 1;
        if (b.type === 'destination') return -1;
        return 0;
      })
      .map(p => [p.lng, p.lat]);

    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    });

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': MAP_COLORS.routeLine,
        'line-width': 3,
        'line-opacity': 0.8,
        'line-dasharray': [2, 2],
      },
    });
  };

  // Zoom controls
  const handleZoomIn = () => {
    map.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    map.current?.zoomOut({ duration: 300 });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {/* Zoom Controls */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors border-b border-gray-100"
            aria-label="Zoom in"
          >
            <Plus size={18} className="text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Zoom out"
          >
            <Minus size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Map Type Toggle */}
        <button
          onClick={() => setMapType(m => m === 'standard' ? 'satellite' : 'standard')}
          className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Toggle map type"
        >
          <Layers size={18} className="text-gray-700" />
        </button>

        {/* Current Location */}
        {selectedShipment?.current_location && (
          <button
            onClick={() => {
              map.current?.flyTo({
                center: [selectedShipment.current_location!.lng, selectedShipment.current_location!.lat],
                speed: CAMERA_CONFIG.flySpeed,
              });
            }}
            className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Go to current location"
          >
            <Navigation size={18} className="text-blue-500" />
          </button>
        )}
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-600 z-10">
        {Math.round(zoom)}x
      </div>

      {/* AirPak Branding */}
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-500 z-10">
        AirPak Maps
      </div>
    </div>
  );
};

export default TrackingMap;

// CSS for pulse animation (add to index.css or component styles)
const pulseStyles = `
@keyframes pulse-marker {
  0%, 100% {
    transform: translate(-50%, -100%) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -100%) scale(1.1);
    opacity: 0.8;
  }
}

.animate-pulse-marker {
  animation: pulse-marker 2s ease-in-out infinite;
}

.custom-map-pin {
  transition: transform 0.2s ease;
}

.custom-map-pin:hover {
  transform: translate(-50%, -100%) scale(1.1);
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = pulseStyles;
  document.head.appendChild(styleEl);
}
