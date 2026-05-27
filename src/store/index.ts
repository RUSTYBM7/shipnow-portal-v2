/**
 * Wales HQ Global Logistics - Zustand Store
 * Global state management with slices for different features
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============== UI Store Slice ==============
interface UIState {
  sidebarOpen: boolean;
  isLoading: boolean;
  loadingMessage: string;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      isLoading: false,
      loadingMessage: '',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setLoading: (loading, message = '') => set({ isLoading: loading, loadingMessage: message }),
    }),
    { name: 'wales-hq-ui' }
  )
);

// ============== User Store Slice ==============
interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  avatar?: string;
  role: 'user' | 'admin';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  region?: string;
  country_code?: string;
  postal_code?: string;
  default_address?: Address;
}

interface Address {
  address: string;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  lat?: number;
  lng?: number;
}

interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      isAuthenticated: false,
      setProfile: (profile) => set({ profile, isAuthenticated: !!profile }),
      logout: () => set({ profile: null, isAuthenticated: false }),
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
      })),
    }),
    { name: 'wales-hq-user' }
  )
);

// ============== Notifications Store Slice ==============
export type NotificationType =
  | 'shipment_update'
  | 'support_message'
  | 'admin_alert'
  | 'system'
  | 'promotion'
  | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  shipmentId?: string;
  ticketId?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
          unreadCount: state.unreadCount + 1,
        }));
      },
      markAsRead: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        }
        return state;
      }),
      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      })),
      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: notification && !notification.read
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      }),
      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    { name: 'wales-hq-notifications' }
  )
);

// ============== Chat Store Slice ==============
export type SenderType = 'user' | 'ai' | 'admin';

interface ChatMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  timestamp: Date;
  read: boolean;
  translatedContent?: string;
  attachments?: string[];
}

interface ChatState {
  activeTicketId: string | null;
  messages: Record<string, ChatMessage[]>; // keyed by ticketId
  isTyping: boolean;
  isEscalated: boolean;
  setActiveTicket: (ticketId: string | null) => void;
  addMessage: (ticketId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'read'>) => void;
  setTyping: (typing: boolean) => void;
  setEscalated: (escalated: boolean) => void;
  markMessageRead: (ticketId: string, messageId: string) => void;
  clearChat: (ticketId: string) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeTicketId: null,
  messages: {},
  isTyping: false,
  isEscalated: false,
  setActiveTicket: (ticketId) => set({ activeTicketId: ticketId }),
  addMessage: (ticketId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [ticketId]: [
        ...(state.messages[ticketId] || []),
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
          read: false,
        }
      ]
    }
  })),
  setTyping: (typing) => set({ isTyping: typing }),
  setEscalated: (escalated) => set({ isEscalated: escalated }),
  markMessageRead: (ticketId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [ticketId]: (state.messages[ticketId] || []).map(m =>
        m.id === messageId ? { ...m, read: true } : m
      )
    }
  })),
  clearChat: (ticketId) => set((state) => {
    const { [ticketId]: _, ...rest } = state.messages;
    return { messages: rest };
  }),
}));

// ============== Shipment Store Slice ==============
export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'customs'
  | 'out_for_delivery'
  | 'delivered'
  | 'exception'
  | 'returned';

interface Location {
  lat: number;
  lng: number;
  timestamp: Date;
  accuracy?: number;
}

interface Shipment {
  id: string;
  tracking_number: string;
  status: ShipmentStatus;
  origin: {
    address: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
    lat: number;
    lng: number;
  };
  current_location?: Location;
  route_polyline?: string;
  carrier_tracking_url?: string;
  weight: number;
  service: 'express' | 'standard' | 'economy';
  estimated_delivery: Date;
  created_at: Date;
  updated_at: Date;
  events: TrackingEvent[];
}

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  timestamp: Date;
  completed: boolean;
  lat?: number;
  lng?: number;
}

interface ShipmentState {
  shipments: Shipment[];
  selectedShipment: Shipment | null;
  isLoading: boolean;
  setShipments: (shipments: Shipment[]) => void;
  selectShipment: (shipment: Shipment | null) => void;
  updateShipmentLocation: (trackingNumber: string, location: Location) => void;
  updateShipmentStatus: (trackingNumber: string, status: ShipmentStatus) => void;
  setLoading: (loading: boolean) => void;
}

export const useShipmentStore = create<ShipmentState>()((set) => ({
  shipments: [],
  selectedShipment: null,
  isLoading: false,
  setShipments: (shipments) => set({ shipments }),
  selectShipment: (shipment) => set({ selectedShipment: shipment }),
  updateShipmentLocation: (trackingNumber, location) => set((state) => ({
    shipments: state.shipments.map(s =>
      s.tracking_number === trackingNumber
        ? { ...s, current_location: location, updated_at: new Date() }
        : s
    ),
    selectedShipment: state.selectedShipment?.tracking_number === trackingNumber
      ? { ...state.selectedShipment, current_location: location, updated_at: new Date() }
      : state.selectedShipment,
  })),
  updateShipmentStatus: (trackingNumber, status) => set((state) => ({
    shipments: state.shipments.map(s =>
      s.tracking_number === trackingNumber
        ? { ...s, status, updated_at: new Date() }
        : s
    ),
    selectedShipment: state.selectedShipment?.tracking_number === trackingNumber
      ? { ...state.selectedShipment, status, updated_at: new Date() }
      : state.selectedShipment,
  })),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ============== Admin Store Slice ==============
interface AdminTicket {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  status: 'ai_handling' | 'escalated' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  assignedAdmin?: string;
  messageCount: number;
  lastMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminState {
  tickets: AdminTicket[];
  activeTicket: AdminTicket | null;
  unreadEscalations: number;
  setTickets: (tickets: AdminTicket[]) => void;
  setActiveTicket: (ticket: AdminTicket | null) => void;
  updateTicketStatus: (ticketId: string, status: AdminTicket['status']) => void;
  assignTicket: (ticketId: string, adminId: string) => void;
  incrementEscalations: () => void;
  clearEscalations: () => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  tickets: [],
  activeTicket: null,
  unreadEscalations: 0,
  setTickets: (tickets) => set({ tickets }),
  setActiveTicket: (ticket) => set({ activeTicket: ticket }),
  updateTicketStatus: (ticketId, status) => set((state) => ({
    tickets: state.tickets.map(t =>
      t.id === ticketId ? { ...t, status, updatedAt: new Date() } : t
    )
  })),
  assignTicket: (ticketId, adminId) => set((state) => ({
    tickets: state.tickets.map(t =>
      t.id === ticketId ? { ...t, assignedAdmin: adminId, status: 'escalated' as const } : t
    )
  })),
  incrementEscalations: () => set((state) => ({ unreadEscalations: state.unreadEscalations + 1 })),
  clearEscalations: () => set({ unreadEscalations: 0 }),
}));

// Export all stores
export const stores = {
  useUIStore,
  useUserStore,
  useNotificationStore,
  useChatStore,
  useShipmentStore,
  useAdminStore,
};

export default stores;
