/**
 * Wales HQ Global Logistics - Chat Routes
 * REST API endpoints for chat functionality
 */

import { Router } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { WalesHQAI } from '../services/minimax.js';

export const chatRouter = (supabase: SupabaseClient, aiService: WalesHQAI) => {
  const router = Router();

  // Initiate a new chat session
  router.post('/initiate', async (req, res) => {
    try {
      const { userId, title = 'New Support Request' } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Create ticket
      const { data: ticket, error } = await supabase
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

      // Create welcome message
      await supabase.from('messages').insert({
        ticket_id: ticket.id,
        sender_id: 'ai',
        sender_type: 'ai',
        content: "Hi! I'm your Wales HQ AI assistant. How can I help you today? I can help with tracking, shipping rates, customs info, and general questions.",
        read_by: [userId],
      });

      res.json({
        success: true,
        ticketId: ticket.id,
        sessionId: ticket.ai_session_id,
      });
    } catch (error: any) {
      console.error('Initiate chat error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Send a message
  router.post('/message', async (req, res) => {
    try {
      const { ticketId, userId, message, history = [], language = 'en' } = req.body;

      if (!ticketId || !userId || !message) {
        return res.status(400).json({ error: 'ticketId, userId, and message are required' });
      }

      // Save user message
      const { data: userMsg, error: userMsgError } = await supabase
        .from('messages')
        .insert({
          ticket_id: ticketId,
          sender_id: userId,
          sender_type: 'user',
          content: message,
          read_by: [userId],
        })
        .select()
        .single();

      if (userMsgError) throw userMsgError;

      // Get AI response
      const aiResponse = await aiService.chat(userId, message, history, language);

      // Save AI response
      const { data: aiMsg, error: aiMsgError } = await supabase
        .from('messages')
        .insert({
          ticket_id: ticketId,
          sender_id: 'ai',
          sender_type: 'ai',
          content: aiResponse.content,
          read_by: [],
        })
        .select()
        .single();

      if (aiMsgError) throw aiMsgError;

      // If escalated, update ticket
      if (aiResponse.escalated) {
        await supabase
          .from('support_tickets')
          .update({
            status: 'escalated',
            ai_handled: false,
            escalation_reason: aiResponse.escalationReason,
          })
          .eq('id', ticketId);
      }

      res.json({
        success: true,
        message: {
          id: aiMsg.id,
          content: aiMsg.content,
          senderType: 'ai',
          timestamp: aiMsg.created_at,
        },
        escalated: aiResponse.escalated,
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get conversation history
  router.get('/history/:ticketId', async (req, res) => {
    try {
      const { ticketId } = req.params;
      const { limit = 50 } = req.query;

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })
        .limit(Number(limit));

      if (error) throw error;

      res.json({ messages: messages || [] });
    } catch (error: any) {
      console.error('Get history error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Escalate to human
  router.post('/escalate', async (req, res) => {
    try {
      const { ticketId, reason } = req.body;

      if (!ticketId) {
        return res.status(400).json({ error: 'ticketId is required' });
      }

      // Update ticket
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'escalated',
          ai_handled: false,
          escalation_reason: reason || 'User requested human assistance',
        })
        .eq('id', ticketId);

      if (error) throw error;

      // Add escalation message
      await supabase.from('messages').insert({
        ticket_id: ticketId,
        sender_id: 'ai',
        sender_type: 'ai',
        content: "Connecting you with our Wales HQ logistics team now...",
        read_by: [],
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error('Escalate error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // AI Draft Response
  router.post('/draft', async (req, res) => {
    try {
      const { ticketId, context } = req.body;

      const draft = await aiService.draftResponse(context || '');
      res.json({ success: true, draft });
    } catch (error: any) {
      console.error('Draft response error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Summarize Thread
  router.post('/summarize', async (req, res) => {
    try {
      const { ticketId } = req.body;

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      const summary = await aiService.summarizeThread(messages || []);
      res.json({ success: true, summary });
    } catch (error: any) {
      console.error('Summarize error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
