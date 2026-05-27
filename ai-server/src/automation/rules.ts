/**
 * Wales HQ Global Logistics - Automation Rules
 * Scheduled tasks for proactive shipment management
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Server as SocketIOServer } from 'socket.io';

interface AutomationRule {
  id: string;
  name: string;
  interval: string; // cron expression
  action: (supabase: SupabaseClient, io?: SocketIOServer) => Promise<void>;
}

export const automationRules: AutomationRule[] = [
  {
    id: 'stalled-shipment-check',
    name: 'Stalled Shipment Detection',
    interval: '*/15 * * * *', // Every 15 minutes
    action: async (supabase) => {
      // Find shipments in transit but not updated in 48 hours
      const { data: stalled } = await supabase
        .from('shipments')
        .select('*')
        .eq('status', 'in_transit')
        .lt('updated_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

      if (!stalled || stalled.length === 0) return;

      console.log(`Found ${stalled.length} stalled shipments`);

      for (const shipment of stalled) {
        // Create support ticket for stalled shipment
        await supabase.from('support_tickets').insert({
          user_id: shipment.user_id,
          title: `Stalled Shipment Alert: ${shipment.tracking_number}`,
          status: 'escalated',
          priority: 'high',
          ai_handled: false,
          escalation_reason: 'Auto-detected stalled shipment (48h+ without update)',
        });

        // Update shipment status
        await supabase
          .from('shipments')
          .update({ status: 'exception' })
          .eq('id', shipment.id);
      }
    },
  },
  {
    id: 'delivery-confirmation',
    name: 'Delivery Confirmation',
    interval: '0 9 * * *', // 9 AM daily
    action: async (supabase) => {
      // Find deliveries from yesterday
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      yesterday.setHours(0, 0, 0, 0);

      const { data: delivered } = await supabase
        .from('shipments')
        .select('*')
        .eq('status', 'delivered')
        .gte('updated_at', yesterday.toISOString());

      if (!delivered || delivered.length === 0) return;

      console.log(`Found ${delivered.length} deliveries yesterday`);

      for (const shipment of delivered) {
        // Add delivery confirmation message to any open tickets
        await supabase.from('messages').insert({
          ticket_id: shipment.user_id,
          sender_id: 'system',
          sender_type: 'ai',
          content: `✅ Great news! Your shipment ${shipment.tracking_number} has been delivered. Thank you for choosing Wales HQ Global Logistics!`,
          read_by: [shipment.user_id],
        });

        // Create delivery feedback request ticket (closed)
        await supabase.from('support_tickets').insert({
          user_id: shipment.user_id,
          title: `Delivery Complete: ${shipment.tracking_number}`,
          status: 'resolved',
          priority: 'low',
          ai_handled: true,
          escalation_reason: 'Delivery confirmation (auto)',
        });
      }
    },
  },
  {
    id: 'ai-escalation-monitor',
    name: 'AI Failure Escalation',
    interval: '*/5 * * * *', // Every 5 minutes
    action: async (supabase) => {
      // Find tickets where AI handled but user sent 3+ messages without resolution
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select(`
          *,
          messages (
            count
          )
        `)
        .eq('status', 'ai_handling')
        .eq('ai_handled', true);

      if (!tickets) return;

      for (const ticket of tickets) {
        const msgCount = ticket.messages?.[0]?.count || 0;

        if (msgCount >= 5) {
          console.log(`Auto-escalating ticket ${ticket.id} (${msgCount} messages)`);

          await supabase
            .from('support_tickets')
            .update({
              status: 'escalated',
              ai_handled: false,
              escalation_reason: 'Auto-escalated: 5+ messages without resolution',
            })
            .eq('id', ticket.id);

          // Add notification message
          await supabase.from('messages').insert({
            ticket_id: ticket.id,
            sender_id: 'system',
            sender_type: 'ai',
            content: "I notice we haven't fully resolved your question. Let me connect you with our Wales HQ team who can provide more detailed assistance.",
            read_by: [],
          });
        }
      }
    },
  },
  {
    id: 'incomplete-registration',
    name: 'Incomplete Registration Follow-up',
    interval: '0 10 * * *', // 10 AM daily
    action: async (supabase) => {
      // Find users registered 7+ days ago without shipments
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, created_at')
        .eq('role', 'user')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (!users) return;

      for (const user of users) {
        const { count } = await supabase
          .from('shipments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (count === 0) {
          console.log(`User ${user.id} registered but no shipments`);

          // Create follow-up ticket (closed)
          await supabase.from('support_tickets').insert({
            user_id: user.id,
            title: 'Ready to ship? Get 10% off your first shipment!',
            status: 'closed',
            priority: 'low',
            ai_handled: true,
            escalation_reason: 'Re-engagement campaign',
          });
        }
      }
    },
  },
  {
    id: 'weather-delay-check',
    name: 'Weather Delay Detection',
    interval: '*/30 * * * *', // Every 30 minutes
    action: async (supabase) => {
      // Check for shipments in transit during potentially delayed regions
      // This is a simplified example - in production, integrate with weather API

      const { data: inTransit } = await supabase
        .from('shipments')
        .select('*')
        .eq('status', 'in_transit');

      if (!inTransit) return;

      // Example: Check destinations in winter-prone areas
      const winterDestinations = ['CA', 'US', 'NO', 'SE', 'FI', 'RU', 'GB'];

      const affectedShipments = inTransit.filter(s =>
        winterDestinations.some(d => s.destination?.country?.includes(d))
      );

      if (affectedShipments.length > 0) {
        console.log(`Found ${affectedShipments.length} shipments potentially affected by weather`);
        // In production: integrate with weather API, create proactive notifications
      }
    },
  },
];

export default automationRules;
