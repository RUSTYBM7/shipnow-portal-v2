// TrackingPageWorkflow.tsx - Advanced Tracking with MapLibre GL JS
// Full-screen map with route visualization, search, and bottom sheet

import { useState, useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Package, Truck, MapPin, Navigation,
  Maximize2, Layers, ChevronUp, ChevronDown, Printer, Share2,
  QrCode, X, AlertTriangle, CheckCircle2, CircleDot, Wind
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================
type ShipmentStatus = 'pending' | 'processing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

interface TrackingEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  location: string;
  description: string;
}

interface Shipment {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  origin: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  current_location?: { lat: number; lng: number };
  estimated_delivery: string;
  events: TrackingEvent[];
  carrier: string;
  weight: number;
  dimensions: string;
  value: number;
  insurance: boolean;
}

interface WeatherData {
  temp: number;
  condition: string;
  wind: string;
}

// ============================================================================
// MAP STYLE (Apple Maps inspired)
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 19,
      paint: {
        'raster-saturation': -0.3,
        'raster-brightness-min': 0.1,
        'raster-brightness-max': 0.9,
      },
    },
  ],
};

// ============================================================================
// STATUS CONFIG
const STATUS_CONFIG: Record<ShipmentStatus, { color: string; icon: React.ReactNode; label: string }> = {
  pending: { color: '#94A3B8', icon: <CircleDot className="w-4 h-4" />, label: 'Pending' },
  processing: { color: '#F59E0B', icon: <Package className="w-4 h-4" />, label: 'Processing' },
  picked_up: { color: '#3B82F6', icon: <Truck className="w-4 h-4" />, label: 'Picked Up' },
  in_transit: { color: '#8B5CF6', icon: <Truck className="w-4 h-4" />, label: 'In Transit' },
  out_for_delivery: { color: '#10B981', icon: <Navigation className="w-4 h-4" />, label: 'Out for Delivery' },
  delivered: { color: '#22C55E', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Delivered' },
  exception: { color: '#EF4444', icon: <AlertTriangle className="w-4 h-4" />, label: 'Exception' },
};

// ============================================================================
// MOCK DATA
const MOCK_SHIPMENT: Shipment = {
  id: 'SP-2024-7845621',
  tracking_number: 'APX7824519630',
  status: 'in_transit',
  origin: { lat: 40.7128, lng: -74.006, address: 'New York, NY' },
  destination: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
  current_location: { lat: 39.7392, lng: -104.9903 },
  estimated_delivery: 'Dec 18, 2024 - 5:00 PM',
  carrier: 'AirPak Express Air',
  weight: 2.5,
  dimensions: '12" x 8" x 6"',
  value: 459.99,
  insurance: true,
  events: [
    { id: '1', timestamp: '2024-12-14T08:30:00Z', status: 'picked_up', location: 'New York, NY', description: 'Package picked up from sender' },
    { id: '2', timestamp: '2024-12-14T14:00:00Z', status: 'in_transit', location: 'Newark, NJ', description: 'Departed sorting facility' },
    { id: '3', timestamp: '2024-12-15T06:00:00Z', status: 'in_transit', location: 'Chicago, IL', description: 'Arrived at regional hub' },
    { id: '4', timestamp: '2024-12-15T18:00:00Z', status: 'in_transit', location: 'Denver, CO', description: 'In transit to destination' },
  ],
};

const WEATHER_DATA: WeatherData = {
  temp: 42,
  condition: 'Partly Cloudy',
  wind: '12 mph NW',
};

// ============================================================================
// COMPONENT
// ============================================================================
export const TrackingPageWorkflow: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'details' | 'timeline' | 'map'>('details');
  const [searchQuery, setSearchQuery] = useState('');
  const [shipment] = useState<Shipment>(MOCK_SHIPMENT);
  const [weather] = useState<WeatherData>(WEATHER_DATA);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-95.7129, 37.0902],
      zoom: 4,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      setIsMapLoaded(true);

      // Add route line
      const routeCoordinates = [
        [shipment.origin.lng, shipment.origin.lat],
        ...shipment.events.map(e => {
          const coords: Record<string, [number, number]> = {
            'Newark, NJ': [-74.1724, 40.7357],
            'Chicago, IL': [-87.6298, 41.8781],
            'Denver, CO': [-104.9903, 39.7392],
          };
          return coords[e.location] || [-95.7129, 37.0902];
        }),
        [shipment.destination.lng, shipment.destination.lat],
      ];

      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates,
          },
        },
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#DC2626',
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1],
        },
      });

      // Add origin marker
      new maplibregl.Marker({ color: '#22C55E' })
        .setLngLat([shipment.origin.lng, shipment.origin.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="p-2"><strong>Origin</strong><br/>New York, NY</div>'))
        .addTo(map);

      // Add destination marker
      new maplibregl.Marker({ color: '#EF4444' })
        .setLngLat([shipment.destination.lng, shipment.destination.lat])
        .setPopup(new maplibregl.Popup().setHTML('<div class="p-2"><strong>Destination</strong><br/>Los Angeles, CA</div>'))
        .addTo(map);

      // Add current location marker (truck)
      if (shipment.current_location) {
        const el = document.createElement('div');
        el.className = 'truck-marker';
        el.innerHTML = `
          <div class="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
          </div>
        `;
        new maplibregl.Marker({ element: el })
          .setLngLat([shipment.current_location.lng, shipment.current_location.lat])
          .setPopup(new maplibregl.Popup().setHTML('<div class="p-2"><strong>Current Location</strong><br/>Denver, CO</div>'))
          .addTo(map);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [shipment]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    // Simulate search - in production would call API
    alert(`Searching for: ${searchQuery}`);
  }, [searchQuery]);

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/95 backdrop-blur-lg border-b border-slate-700 px-4 py-3 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Track shipment (e.g., APX7824519630)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Track
        </button>
        <div className="flex items-center gap-2 text-slate-400">
          <Wind className="w-4 h-4" />
          <span className="text-sm">{weather.temp}°F</span>
          <span className="text-xs">{weather.condition}</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="absolute inset-0" />

        {/* Map Overlay Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <button className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-lg hover:bg-white transition-colors">
            <Layers className="w-5 h-5 text-slate-700" />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-lg hover:bg-white transition-colors">
            <Maximize2 className="w-5 h-5 text-slate-700" />
          </button>
        </div>

        {/* Live Badge */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-slate-700">LIVE TRACKING</span>
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: 300 }}
        animate={{ y: bottomSheetOpen ? 0 : 300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-slate-800 rounded-t-2xl shadow-2xl"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <button
            onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
            className="w-12 h-1 bg-slate-600 rounded-full"
          />
        </div>

        {/* Shipment Header */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{shipment.tracking_number}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: STATUS_CONFIG[shipment.status].color + '20', color: STATUS_CONFIG[shipment.status].color }}
              >
                {STATUS_CONFIG[shipment.status].icon}
                <span className="ml-1">{STATUS_CONFIG[shipment.status].label}</span>
              </span>
              <span className="text-xs text-slate-400">
                Estimated: {shipment.estimated_delivery}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <QrCode className="w-5 h-5 text-slate-300" />
            </button>
            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <Printer className="w-5 h-5 text-slate-300" />
            </button>
            <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              <Share2 className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 flex gap-1 bg-slate-700/30 rounded-lg p-1 mx-4">
          {(['details', 'timeline', 'map'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                selectedTab === tab
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="h-64 overflow-y-auto p-4">
          {selectedTab === 'details' && (
            <div className="space-y-4">
              {/* Route Info */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <div className="w-0.5 h-12 bg-slate-600" />
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">From</p>
                    <p className="text-sm text-white font-medium">{shipment.origin.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">To</p>
                    <p className="text-sm text-white font-medium">{shipment.destination.address}</p>
                  </div>
                </div>
              </div>

              {/* Package Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Carrier</p>
                  <p className="text-sm text-white font-medium">{shipment.carrier}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Weight</p>
                  <p className="text-sm text-white font-medium">{shipment.weight} lbs</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Dimensions</p>
                  <p className="text-sm text-white font-medium">{shipment.dimensions}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">Value</p>
                  <p className="text-sm text-white font-medium">${shipment.value.toFixed(2)}</p>
                </div>
              </div>

              {shipment.insurance && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-400">Package insured up to $500</span>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'timeline' && (
            <div className="space-y-4">
              {shipment.events.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-red-500' : 'bg-slate-600'
                      }`}
                    />
                    {index < shipment.events.length - 1 && (
                      <div className="w-0.5 h-16 bg-slate-700" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-white font-medium">{event.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{event.location}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'map' && (
            <div className="h-full flex items-center justify-center text-slate-400">
              <p className="text-sm">Expanded map view - zoom, pan, and explore the route</p>
            </div>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setBottomSheetOpen(!bottomSheetOpen)}
          className="w-full py-3 flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-700 transition-colors"
        >
          {bottomSheetOpen ? (
            <>
              <ChevronDown className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">Show Less</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">View Details</span>
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default TrackingPageWorkflow;