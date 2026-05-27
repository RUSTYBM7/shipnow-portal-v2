/**
 * Wales HQ Global Logistics - AI Server
 * Express + Socket.io server for AI chat, escalation, and automation
 */

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import cron from 'node-cron';
import { chatRouter } from './routes/chat.js';
import { automationRules } from './automation/rules.js';
import { WalesHQAI } from './services/minimax.js';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST'],
  },
});

// Environment
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zygoqqsgzhgpvlpttfbk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Initialize AI service
const aiService = new WalesHQAI(supabase);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/chat', chatRouter(supabase, aiService));

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Admin joining a ticket room
  socket.on('admin_join', async ({ ticketId, adminId }) => {
    socket.join(`ticket:${ticketId}`);
    socket.join(`admin:${adminId}`);

    // Update ticket assignment
    await supabase
      .from('support_tickets')
      .update({ assigned_admin: adminId })
      .eq('id', ticketId);

    // Notify user
    socket.to(`ticket:${ticketId}`).emit('admin_joined', { adminId });

    console.log(`Admin ${adminId} joined ticket ${ticketId}`);
  });

  // Admin sending message
  socket.on('admin_message', async ({ ticketId, adminId, content }) => {
    // Save to database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        ticket_id: ticketId,
        sender_id: adminId,
        sender_type: 'admin',
        content,
        read_by: [adminId],
      })
      .select()
      .single();

    if (!error && data) {
      // Broadcast to ticket room
      io.to(`ticket:${ticketId}`).emit('new_message', {
        ...data,
        senderType: 'admin',
      });
    }
  });

  // Typing indicator
  socket.on('typing', ({ ticketId, senderType }) => {
    socket.to(`ticket:${ticketId}`).emit('user_typing', { senderType });
  });

  // Read receipts
  socket.on('mark_read', async ({ ticketId, messageId, userId }) => {
    await supabase.rpc('mark_message_read', {
      p_message_id: messageId,
      p_user_id: userId,
    });

    io.to(`ticket:${ticketId}`).emit('message_read', { messageId, userId });
  });

  // Escalation notification to admin dashboard
  socket.on('escalate', async ({ ticketId, reason }) => {
    io.emit('new_escalation', { ticketId, reason });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Automation cron jobs
const setupAutomation = () => {
  automationRules.forEach((rule) => {
    cron.schedule(rule.interval, async () => {
      try {
        console.log(`Running automation: ${rule.id}`);
        await rule.action(supabase, io);
      } catch (error) {
        console.error(`Automation ${rule.id} failed:`, error);
      }
    });
  });

  console.log(`✅ Configured ${automationRules.length} automation rules`);
};

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales HQ Global Logistics - AI Server                 ║
║                                                               ║
║     🌐 Server running on port ${PORT}                            ║
║     📡 Socket.io enabled                                       ║
║     🤖 AI automation configured                               ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  setupAutomation();
});

export { app, io, supabase };
