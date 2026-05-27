/**
 * Wales HQ Global Logistics - Map Configuration
 *
 * CONFIGURATION FLAG: Set USE_MAPKIT = true when Apple Developer Program license is obtained
 * This enables MapKit JS with zero UI changes
 */

// Map provider configuration
export const USE_MAPKIT = import.meta.env.VITE_USE_MAPKIT === 'true';
export const MAPKIT_TEAM_ID = import.meta.env.VITE_MAPKIT_TEAM_ID || '';
export const MAPKIT_KEY_ID = import.meta.env.VITE_MAPKIT_KEY_ID || '';

// Fallback MapLibre configuration
export const MAPLIBRE_STYLE_URL = import.meta.env.VITE_MAPLIBRE_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';
export const MAPLIBRE_ATTRIBUTION = '© OpenStreetMap contributors';

// Map center (Cardiff, Wales HQ)
export const DEFAULT_CENTER: [number, number] = [-3.7833, 51.4816];
export const DEFAULT_ZOOM = 6;

// Apple Maps clone style colors
export const MAP_COLORS = {
  water: '#A1C5F7',
  land: '#F2F2F7',
  roads: '#FFFFFF',
  buildings: '#E8E8ED',
  labels: '#1C1C1E',
  pinOrigin: '#34C759',
  pinDestination: '#FF3B30',
  pinCurrent: '#007AFF',
  routeLine: '#007AFF',
} as const;

// Map pin configuration
export const PIN_CONFIG = {
  origin: {
    color: MAP_COLORS.pinOrigin,
    label: 'Origin',
  },
  destination: {
    color: MAP_COLORS.pinDestination,
    label: 'Destination',
  },
  current: {
    color: MAP_COLORS.pinCurrent,
    label: 'Current Location',
    pulse: true,
  },
  waypoint: {
    color: '#8E8E93',
    label: 'Waypoint',
  },
} as const;

// Camera animation settings
export const CAMERA_CONFIG = {
  flySpeed: 1.2,
  flyCurve: 1.42,
  maxZoom: 18,
  minZoom: 3,
} as const;

// Export map config for components
export const mapConfig = {
  useMapKit: USE_MAPKIT,
  mapLibreStyle: MAPLIBRE_STYLE_URL,
  defaultCenter: DEFAULT_CENTER,
  defaultZoom: DEFAULT_ZOOM,
  colors: MAP_COLORS,
  pins: PIN_CONFIG,
  camera: CAMERA_CONFIG,
} as const;

export default mapConfig;
