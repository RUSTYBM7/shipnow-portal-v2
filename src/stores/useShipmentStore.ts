// Shipment Store - manages shipment data and loading states
import { create } from 'zustand';

type ShipmentStatus = 'pending' | 'processing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

interface PackageDetails {
  weight: number;
  dimensions: string;
  description: string;
  quantity: number;
  value: number;
  insured: boolean;
}

interface ShipmentData {
  id: string;
  tracking_number: string;
  user_id: string;
  status: ShipmentStatus;
  carrier: string;
  service_type: string;
  origin: Address;
  destination: Address;
  package: PackageDetails;
  estimated_cost: number;
  actual_cost?: number;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  delivered_at?: string;
  proof_of_delivery?: string;
}

interface ShipmentFilters {
  status?: ShipmentStatus;
  dateRange?: { start: string; end: string };
  carrier?: string;
  search?: string;
}

interface ShipmentState {
  shipments: ShipmentData[];
  selectedShipment: ShipmentData | null;
  isLoading: boolean;
  error: string | null;
  filters: ShipmentFilters;
  totalCount: number;
  page: number;
  pageSize: number;

  // Actions
  setShipments: (shipments: ShipmentData[]) => void;
  addShipment: (shipment: ShipmentData) => void;
  updateShipment: (id: string, updates: Partial<ShipmentData>) => void;
  removeShipment: (id: string) => void;
  selectShipment: (shipment: ShipmentData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ShipmentFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export const useShipmentStore = create<ShipmentState>((set, get) => ({
  shipments: [],
  selectedShipment: null,
  isLoading: false,
  error: null,
  filters: {},
  totalCount: 0,
  page: 1,
  pageSize: 10,

  setShipments: (shipments) => set({ shipments }),

  addShipment: (shipment) => set((state) => ({
    shipments: [shipment, ...state.shipments],
    totalCount: state.totalCount + 1,
  })),

  updateShipment: (id, updates) => set((state) => ({
    shipments: state.shipments.map((s) =>
      s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
    ),
    selectedShipment: state.selectedShipment?.id === id
      ? { ...state.selectedShipment, ...updates }
      : state.selectedShipment,
  })),

  removeShipment: (id) => set((state) => ({
    shipments: state.shipments.filter((s) => s.id !== id),
    totalCount: Math.max(0, state.totalCount - 1),
    selectedShipment: state.selectedShipment?.id === id ? null : state.selectedShipment,
  })),

  selectShipment: (shipment) => set({ selectedShipment: shipment }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
    page: 1, // Reset to first page when filters change
  })),

  clearFilters: () => set({ filters: {}, page: 1 }),

  setPage: (page) => set({ page }),

  setPageSize: (pageSize) => set({ pageSize, page: 1 }),
}));