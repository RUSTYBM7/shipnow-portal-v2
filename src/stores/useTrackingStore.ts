// Tracking Store - manages active shipments, map view, and route progress
import { create } from 'zustand';

type ShipmentStatus = 'pending' | 'processing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

interface TrackingLocation {
  lat: number;
  lng: number;
  address: string;
}

interface TrackingEvent {
  id: string;
  timestamp: string;
  status: ShipmentStatus;
  location: string;
  description: string;
}

interface TrackingShipment {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  origin: TrackingLocation;
  destination: TrackingLocation;
  current_location?: TrackingLocation;
  estimated_delivery: string;
  events: TrackingEvent[];
  carrier: string;
  weight: number;
  progress: number; // 0-100
}

interface MapView {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
}

interface TrackingState {
  activeShipment: TrackingShipment | null;
  searchHistory: string[];
  mapView: MapView;
  isLiveTracking: boolean;

  // Actions
  setActiveShipment: (shipment: TrackingShipment | null) => void;
  addToSearchHistory: (trackingNumber: string) => void;
  clearSearchHistory: () => void;
  setMapView: (view: Partial<MapView>) => void;
  flyToRoute: () => void;
  updateProgress: (progress: number) => void;
  toggleLiveTracking: (enabled?: boolean) => void;
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  activeShipment: null,
  searchHistory: [],
  mapView: {
    longitude: -97,
    latitude: 39.8,
    zoom: 4,
    pitch: 45,
  },
  isLiveTracking: false,

  setActiveShipment: (shipment) => set({ activeShipment: shipment }),

  addToSearchHistory: (trackingNumber) => set((state) => ({
    searchHistory: [
      trackingNumber,
      ...state.searchHistory.filter(t => t !== trackingNumber)
    ].slice(0, 10)
  })),

  clearSearchHistory: () => set({ searchHistory: [] }),

  setMapView: (view) => set((state) => ({
    mapView: { ...state.mapView, ...view }
  })),

  flyToRoute: () => {
    const { activeShipment } = get();
    if (activeShipment) {
      const centerLng = (activeShipment.origin.lng + activeShipment.destination.lng) / 2;
      const centerLat = (activeShipment.origin.lat + activeShipment.destination.lat) / 2;
      set({
        mapView: {
          longitude: centerLng,
          latitude: centerLat,
          zoom: 5,
          pitch: 45,
        }
      });
    }
  },

  updateProgress: (progress) => set((state) => ({
    activeShipment: state.activeShipment
      ? { ...state.activeShipment, progress }
      : null
  })),

  toggleLiveTracking: (enabled) => set((state) => ({
    isLiveTracking: enabled !== undefined ? enabled : !state.isLiveTracking
  })),
}));