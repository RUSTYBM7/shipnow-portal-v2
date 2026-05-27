/**
 * Wales HQ Global Logistics - Shipment Tracking Hook
 * Supabase Realtime integration for live tracking updates
 */

import { useEffect, useCallback } from 'react';
import { useShipmentStore, useNotificationStore } from '../store';
import { supabase } from '../lib/supabase';

interface UseShipmentTrackingOptions {
  trackingNumber?: string;
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  onStatusChange?: (status: string) => void;
}

export const useShipmentTracking = (options: UseShipmentTrackingOptions = {}) => {
  const { trackingNumber, onLocationUpdate, onStatusChange } = options;
  const {
    updateShipmentLocation,
    updateShipmentStatus,
    selectedShipment,
    shipments
  } = useShipmentStore();
  const { addNotification } = useNotificationStore();

  // Subscribe to real-time updates
  useEffect(() => {
    if (!trackingNumber) return;

    const channel = supabase
      .channel(`shipment-${trackingNumber}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `tracking_number=eq.${trackingNumber}`,
        },
        async (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;

          // Check for location update
          if (newData.current_location &&
              JSON.stringify(newData.current_location) !== JSON.stringify(oldData?.current_location)) {
            updateShipmentLocation(trackingNumber, {
              lat: newData.current_location.lat,
              lng: newData.current_location.lng,
              timestamp: new Date(newData.current_location.timestamp),
              accuracy: newData.current_location.accuracy,
            });
            onLocationUpdate?.({
              lat: newData.current_location.lat,
              lng: newData.current_location.lng,
            });
          }

          // Check for status change
          if (newData.status !== oldData?.status) {
            updateShipmentStatus(trackingNumber, newData.status);
            onStatusChange?.(newData.status);

            // Send notification
            addNotification({
              type: 'shipment_update',
              title: 'Shipment Status Updated',
              body: `Package ${trackingNumber} is now ${newData.status.replace('_', ' ')}`,
              actionUrl: `/tracking/${trackingNumber}`,
              shipmentId: trackingNumber,
              metadata: {
                oldStatus: oldData?.status,
                newStatus: newData.status,
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trackingNumber, updateShipmentLocation, updateShipmentStatus, addNotification, onLocationUpdate, onStatusChange]);

  // Fetch shipment details
  const fetchShipment = useCallback(async () => {
    if (!trackingNumber) return null;

    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .single();

    if (error) {
      console.error('Error fetching shipment:', error);
      return null;
    }

    return data;
  }, [trackingNumber]);

  // Fetch tracking events
  const fetchTrackingEvents = useCallback(async () => {
    if (!trackingNumber) return [];

    const { data, error } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching tracking events:', error);
      return [];
    }

    return data || [];
  }, [trackingNumber]);

  return {
    shipment: selectedShipment || shipments.find(s => s.tracking_number === trackingNumber),
    fetchShipment,
    fetchTrackingEvents,
  };
};

export default useShipmentTracking;
