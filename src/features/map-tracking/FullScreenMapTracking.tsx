import React, { useState, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Search, Navigation, Share2, X, Info, ArrowLeft, Clock, Cpu } from 'lucide-react';
import { useShipmentsStore } from '../../lib/shipmentsStore';
import toast from 'react-hot-toast';

export const FullScreenMapTracking: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { currentShipment, trackingEvents, fetchByTracking, fetchTrackingEvents, isLoading } = useShipmentsStore();

  useEffect(() => {
    const hashParts = window.location.hash.split('?');
    if (hashParts.length > 1) {
      const params = new URLSearchParams(hashParts[1]);
      const id = params.get('id');
      if (id) {
        setSearchQuery(id);
        fetchByTracking(id);
        fetchTrackingEvents(id);
      }
    }
  }, [fetchByTracking, fetchTrackingEvents]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [60, 30],
      zoom: 2,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Compute route points from tracking events
  const routePoints = React.useMemo(() => {
    if (!trackingEvents || trackingEvents.length === 0) return [];

    const points = trackingEvents
      .filter(e => e.lat !== undefined && e.lng !== undefined)
      .map(event => ({
        lat: event.lat as number,
        lng: event.lng as number,
        name: event.location,
        status: event.completed ? 'completed' : 'pending',
        eventStatus: event.status,
        timestamp: event.timestamp
      }));

    // Mark the last completed event as 'current'
    const lastCompletedIndex = [...points].reverse().findIndex(p => p.status === 'completed');
    if (lastCompletedIndex !== -1) {
      points[points.length - 1 - lastCompletedIndex].status = 'current';
    }

    return points;
  }, [trackingEvents]);

  // Update map markers when data changes
  useEffect(() => {
    if (!mapLoaded || !map.current || routePoints.length === 0) return;

    const currentMap = map.current;

    // Remove existing layers and sources if they exist
    if (currentMap.getLayer('route-line')) currentMap.removeLayer('route-line');
    if (currentMap.getSource('route')) currentMap.removeSource('route');

    // Add route line
    currentMap.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routePoints.map(p => [p.lng, p.lat]),
        },
      },
    });

    currentMap.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#DC143C',
        'line-width': 3,
        'line-dasharray': [2, 2],
      },
    });

    // Remove old point layers and sources
    routePoints.forEach((_, idx) => {
      if (currentMap.getLayer(`point-circle-${idx}`)) currentMap.removeLayer(`point-circle-${idx}`);
      if (currentMap.getLayer(`point-label-${idx}`)) currentMap.removeLayer(`point-label-${idx}`);
      if (currentMap.getSource(`point-${idx}`)) currentMap.removeSource(`point-${idx}`);
    });

    // Add points
    routePoints.forEach((point, idx) => {
      const color = point.status === 'current' ? '#10B981' : point.status === 'completed' ? '#007AFF' : '#8E8E93';

      currentMap.addSource(`point-${idx}`, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { name: point.name, status: point.status, idx },
          geometry: { type: 'Point', coordinates: [point.lng, point.lat] },
        },
      });

      currentMap.addLayer({
        id: `point-circle-${idx}`,
        type: 'circle',
        source: `point-${idx}`,
        paint: {
          'circle-radius': point.status === 'current' ? 12 : 8,
          'circle-color': color,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      currentMap.addLayer({
        id: `point-label-${idx}`,
        type: 'symbol',
        source: `point-${idx}`,
        layout: {
          'text-field': point.name,
          'text-size': 12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 1,
        },
      });
    });

    // Fit bounds to show all points
    const bounds = new maplibregl.LngLatBounds(
      [routePoints[0].lng, routePoints[0].lat],
      [routePoints[0].lng, routePoints[0].lat]
    );
    for (const p of routePoints) {
      bounds.extend([p.lng, p.lat]);
    }
    currentMap.fitBounds(bounds, { padding: 50 });

    const handlePointClick = (e: any) => {
      const features = currentMap.queryRenderedFeatures(e.point, { layers: routePoints.map((_, i) => `point-circle-${i}`) });
      if (features && features.length > 0) {
        const idx = features[0].properties.idx;
        setSelectedPoint(routePoints[idx]);
        setShowDetails(true);
      }
    };

    const handleMouseEnter = () => {
      currentMap.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      currentMap.getCanvas().style.cursor = '';
    };

    const pointLayers = routePoints.map((_, i) => `point-circle-${i}`);

    currentMap.on('click', handlePointClick);
    currentMap.on('mouseenter', pointLayers, handleMouseEnter);
    currentMap.on('mouseleave', pointLayers, handleMouseLeave);

    return () => {
      currentMap.off('click', handlePointClick);
      currentMap.off('mouseenter', pointLayers, handleMouseEnter);
      currentMap.off('mouseleave', pointLayers, handleMouseLeave);
    };
  }, [mapLoaded, routePoints]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      fetchByTracking(searchQuery.trim());
      fetchTrackingEvents(searchQuery.trim());
      window.location.hash = `/tracking?id=${searchQuery.trim()}`;
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Tracking link copied to clipboard!');
    });
  };

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();

  // If we have selected a point, fly to it
  useEffect(() => {
    if (mapLoaded && map.current && selectedPoint) {
      map.current.flyTo({
        center: [selectedPoint.lng, selectedPoint.lat],
        zoom: 6,
        duration: 1000,
      });
    }
  }, [selectedPoint, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Top Overlay - Search Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-3 flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking number..."
              className="flex-1 text-gray-900 placeholder-gray-400 focus:outline-none text-base"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Card - Tracking Info */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="bg-white rounded-t-3xl shadow-2xl pointer-events-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="px-5 pb-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-[#DC143C] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : currentShipment ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <p className="text-xs text-gray-500">Tracking Number</p>
                      <p className="font-bold text-lg">{currentShipment.tracking_number}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    currentShipment.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    currentShipment.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {currentShipment.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Route Pills */}
                {routePoints.length > 0 && (
                  <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                    {routePoints.map((point, i) => (
                      <div key={i} className="flex items-center">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm whitespace-nowrap ${
                          point.status === 'current' ? 'bg-green-100 text-green-700' :
                          point.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            point.status === 'current' ? 'bg-green-500 animate-pulse' :
                            point.status === 'completed' ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`} />
                          {point.name}
                        </div>
                        {i < routePoints.length - 1 && (
                          <div className="w-6 h-0.5 bg-gray-300 mx-1 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">From</p>
                    <p className="text-sm font-semibold">{currentShipment.origin.city}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">To</p>
                    <p className="text-sm font-semibold">{currentShipment.destination.city}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">ETA</p>
                    <p className="text-sm font-semibold text-[#DC143C]">
                      {new Date(currentShipment.estimated_delivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button onClick={() => setShowDetails(!showDetails)} className="flex-1 py-3 bg-[#DC143C] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-[#B01030] transition-colors">
                    <Navigation className="w-4 h-4" />
                    {showDetails ? 'Hide Details' : 'View Details'}
                  </button>
                  <button onClick={handleShare} className="py-3 px-5 bg-gray-100 text-gray-700 rounded-xl font-medium flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-gray-500">
                {searchQuery ? 'Shipment not found. Please check the tracking number.' : 'Enter a tracking number to view shipment details.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="absolute right-4 top-20 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2">
          <button onClick={handleZoomIn} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50">
            <span className="text-lg font-bold">+</span>
          </button>
          <button onClick={handleZoomOut} className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50">
            <span className="text-lg font-bold">−</span>
          </button>
          <button className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 group relative">
            <Info className="w-5 h-5 text-gray-600" />
            <div className="absolute right-full mr-2 bg-white px-3 py-1 rounded shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              MapLibre GL Navigation
            </div>
          </button>
        </div>
      </div>

      {/* AI Status Badge */}
      <div className="absolute left-4 top-20 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 pointer-events-auto">
          <Cpu className="w-4 h-4 text-[#DC143C]" />
          <span className="text-xs font-medium">AI Tracking Active</span>
        </div>
      </div>

      {/* Point Details Overlay */}
      {selectedPoint && showDetails && (
        <div className="absolute top-1/3 left-4 right-4 z-20 bg-white rounded-2xl shadow-2xl p-4 max-w-sm mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                selectedPoint.status === 'current' ? 'bg-green-100 text-green-700' :
                selectedPoint.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {selectedPoint.status === 'current' ? 'Current Location' : selectedPoint.status === 'completed' ? 'Completed' : 'Pending'}
              </span>
            </div>
            <button onClick={() => setSelectedPoint(null)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h3 className="font-bold text-lg mb-1">{selectedPoint.name}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-2 gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(selectedPoint.timestamp).toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-700 font-medium">
            Status: {selectedPoint.eventStatus}
          </p>
        </div>
      )}
    </div>
  );
};
