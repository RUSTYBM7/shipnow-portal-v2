/**
 * Wales HQ Global Logistics - Supabase Client
 * Database connection and helper functions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zygoqqsgzhgpvlpttfbk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5Z29xcXNnemhncHZscHR0ZmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDAwNzQsImV4cCI6MjA5NTI3NjA3NH0.k3SWSNXtvAI-z1sBQxOwIhXWLt34nszv7EC5nktruNw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      shipments: {
        Row: {
          id: string;
          user_id: string;
          tracking_number: string;
          status: 'pending' | 'picked_up' | 'in_transit' | 'customs' | 'out_for_delivery' | 'delivered' | 'exception' | 'returned';
          origin: any;
          destination: any;
          current_location?: any;
          route_polyline?: string;
          carrier_tracking_url?: string;
          weight: number;
          service: 'express' | 'standard' | 'economy';
          estimated_delivery: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shipments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['shipments']['Insert']>;
      };
      tracking_events: {
        Row: {
          id: string;
          shipment_id: string;
          tracking_number: string;
          status: string;
          location: string;
          timestamp: string;
          completed: boolean;
          lat?: number;
          lng?: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tracking_events']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tracking_events']['Insert']>;
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: 'ai_handling' | 'escalated' | 'resolved' | 'closed';
          priority: 'high' | 'medium' | 'low';
          ai_session_id?: string;
          ai_handled: boolean;
          escalation_reason?: string;
          assigned_admin?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['support_tickets']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['support_tickets']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_id: string;
          sender_type: 'user' | 'ai' | 'admin';
          content: string;
          translated_content?: any;
          read_by: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
    };
  };
}

// Helper functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getShipments = async (userId?: string) => {
  let query = supabase
    .from('shipments')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getShipmentByTracking = async (trackingNumber: string) => {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('tracking_number', trackingNumber)
    .single();

  if (error) throw error;
  return data;
};

export const getTrackingEvents = async (trackingNumber: string) => {
  const { data, error } = await supabase
    .from('tracking_events')
    .select('*')
    .eq('tracking_number', trackingNumber)
    .order('timestamp', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createSupportTicket = async (userId: string, title: string) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      user_id: userId,
      title,
      status: 'ai_handling',
      priority: 'medium',
      ai_handled: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getMessages = async (ticketId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const sendMessage = async (
  ticketId: string,
  senderId: string,
  senderType: 'user' | 'ai' | 'admin',
  content: string
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      ticket_id: ticketId,
      sender_id: senderId,
      sender_type: senderType,
      content,
      read_by: [senderId],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Create new shipment
export const createShipment = async (userId: string, shipmentData: {
  origin: any;
  destination: any;
  package: any;
  service: string;
  options: any;
  price: number;
}) => {
  const trackingNumber = `APK${Date.now().toString().slice(-10)}`;

  const { data, error } = await supabase
    .from('shipments')
    .insert({
      user_id: userId,
      tracking_number: trackingNumber,
      status: 'pending',
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      weight: Number(shipmentData.package.weight) || 0,
      service: shipmentData.service,
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, tracking_number: trackingNumber };
};

// Get user stats
export const getUserStats = async (userId: string) => {
  const { data: shipments, error } = await supabase
    .from('shipments')
    .select('status')
    .eq('user_id', userId);

  if (error) throw error;

  const stats = {
    total: shipments?.length || 0,
    inTransit: shipments?.filter(s => s.status === 'in_transit' || s.status === 'out_for_delivery').length || 0,
    delivered: shipments?.filter(s => s.status === 'delivered').length || 0,
    pending: shipments?.filter(s => s.status === 'pending').length || 0,
  };

  return stats;
};

// Notifications
export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
};

export default supabase;
