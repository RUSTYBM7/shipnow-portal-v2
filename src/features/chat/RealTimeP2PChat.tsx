// RealTimeP2PChat.tsx - Real-Time P2P Chat with AI Integration
// Supabase Realtime + Socket.io + MiniMax AI

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, MoreVertical, Phone, Video, Smile, Check, CheckCheck, Circle } from 'lucide-react';
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================
type SenderType = 'user' | 'ai' | 'admin';

interface Message {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: SenderType;
  content: string;
  attachments: string[];
  read_by: string[];
  created_at: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface TypingIndicator {
  user_id: string;
  user_name: string;
  is_typing: boolean;
}

interface ChatRoom {
  ticket_id: string;
  title: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
}

// ============================================================================
// ZUSTAND STORE
// ============================================================================
interface ChatState {
  messages: Message[];
  typingUsers: TypingIndicator[];
  isConnected: boolean;
  currentUser: { id: string; name: string; role: SenderType } | null;
  sendMessage: (content: string, attachments?: string[]) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  markAsRead: (messageId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  typingUsers: [],
  isConnected: false,
  currentUser: null,

  sendMessage: async (content, attachments = []) => {
    const { currentUser } = get();
    if (!currentUser) return;

    const tempId = `temp_${Date.now()}`;
    const newMessage: Message = {
      id: tempId,
      ticket_id: 'current_ticket',
      sender_id: currentUser.id,
      sender_type: currentUser.role,
      content,
      attachments,
      read_by: [currentUser.id],
      created_at: new Date().toISOString(),
      status: 'sending',
    };

    set((state) => ({ messages: [...state.messages, newMessage] }));

    // Save to Supabase
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ticket_id: 'current_ticket',
          sender_id: currentUser.id,
          sender_type: currentUser.role,
          content,
          attachments,
        })
        .select()
        .single();

      if (!error && data) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === tempId ? { ...data, status: 'sent' as const } : m
          ),
        }));
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  },

  setTyping: (isTyping) => {
    // Socket.io would emit typing event here
    console.log('Typing:', isTyping);
  },

  markAsRead: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, status: 'read' as const } : m
      ),
    }));
  },
}));

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, showAvatar = true }) => {
  const getBubbleStyle = () => {
    switch (message.sender_type) {
      case 'user':
        return isOwn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900';
      case 'ai':
        return 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white';
      case 'admin':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <Circle className="w-3 h-3 animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-300" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${message.sender_type === 'ai' ? 'justify-center' : ''}`}
    >
      {message.sender_type === 'ai' ? (
        // AI Message Centered
        <div className="max-w-[80%]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <span className="text-xs text-slate-500">AirPak Assistant</span>
          </div>
          <div className={`rounded-2xl px-4 py-3 ${getBubbleStyle()}`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ) : (
        // Regular Message
        <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
          {showAvatar && !isOwn && (
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.sender_type === 'admin' ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <span className="text-xs font-medium text-white">
                {message.sender_type === 'admin' ? 'A' : 'U'}
              </span>
            </div>
          )}
          <div className={`rounded-2xl px-4 py-3 ${getBubbleStyle()}`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
              <span className="text-[10px] opacity-70">
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {isOwn && getStatusIcon()}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// TYPING INDICATOR
// ============================================================================
interface TypingIndicatorBubbleProps {
  users: TypingIndicator[];
}

const TypingIndicatorBubble: React.FC<TypingIndicatorBubbleProps> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut',
            }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
        ))}
      </div>
      <span className="text-sm text-slate-500">
        {users[0].user_name} {users.length > 1 ? `and ${users.length - 1} others` : ''} typing...
      </span>
    </motion.div>
  );
};

// ============================================================================
// QUICK ACTION CHIPS
// ============================================================================
interface QuickActionChipsProps {
  onSelect: (action: string) => void;
}

const QuickActionChips: React.FC<QuickActionChipsProps> = ({ onSelect }) => {
  const actions = [
    { label: 'Track Package', icon: '📦', action: 'track' },
    { label: 'Get Rate', icon: '💰', action: 'rate' },
    { label: 'File Claim', icon: '📋', action: 'claim' },
    { label: 'Contact Agent', icon: '👤', action: 'agent' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 -mx-4">
      {actions.map((a) => (
        <button
          key={a.action}
          onClick={() => onSelect(a.action)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-sm whitespace-nowrap hover:bg-slate-200 transition-colors"
        >
          <span>{a.icon}</span>
          {a.label}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// MESSAGE INPUT
// ============================================================================
interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, onTyping, disabled }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
      onTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping(true);
  };

  return (
    <div className={`flex items-end gap-3 p-4 border-t transition-all ${isFocused ? 'bg-slate-50' : ''}`}>
      <button className="p-2 hover:bg-slate-100 rounded-full">
        <Paperclip className="w-5 h-5 text-slate-500" />
      </button>
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <button
        onClick={handleSend}
        disabled={!message.trim()}
        className={`p-3 rounded-full transition-all ${
          message.trim()
            ? 'bg-blue-500 hover:bg-blue-600 shadow-lg'
            : 'bg-slate-200 cursor-not-allowed'
        }`}
      >
        <Send className={`w-5 h-5 ${message.trim() ? 'text-white' : 'text-slate-400'}`} />
      </button>
    </div>
  );
};

// ============================================================================
// AI ESCALATION TRIGGER
// ============================================================================
interface AIEscalationProps {
  onEscalate: (trigger: 'human' | 'agent' | 'frustrated') => void;
}

const AIEscalation: React.FC<AIEscalationProps> = ({ onEscalate }) => {
  const triggers = [
    { label: 'Talk to Human', trigger: 'human' as const, color: 'bg-red-500' },
    { label: 'Contact Agent', trigger: 'agent' as const, color: 'bg-blue-500' },
    { label: 'Frustrated', trigger: 'frustrated' as const, color: 'bg-orange-500' },
  ];

  return (
    <div className="flex gap-2 px-4 pb-2">
      {triggers.map((t) => (
        <button
          key={t.trigger}
          onClick={() => onEscalate(t.trigger)}
          className={`px-3 py-1 ${t.color} text-white text-xs font-medium rounded-full hover:opacity-90`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// ADMIN CO-PILOT TOOLS
// ============================================================================
interface AdminCoPilotProps {
  onInsertResponse?: (response: string) => void;
}

const AdminCoPilot: React.FC<AdminCoPilotProps> = ({ onInsertResponse }) => {
  const suggestions = [
    'Your package is currently in transit and expected to arrive by tomorrow.',
    'I\'ve checked the status and your shipment is on schedule.',
    'I can help you file a claim. Please provide your tracking number.',
    'Our customer service team will contact you within 24 hours.',
  ];

  return (
    <div className="bg-slate-800 rounded-t-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">AI</span>
        </div>
        <span className="text-sm font-medium text-white">AI Co-Pilot Suggestions</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onInsertResponse?.(suggestion)}
            className="w-full text-left p-3 bg-slate-700 rounded-lg text-sm text-slate-200 hover:bg-slate-600 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SHIPMENT CARD (Rich Message)
// ============================================================================
interface ShipmentCardProps {
  tracking_number: string;
  status: string;
  eta: string;
  onTap?: () => void;
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({ tracking_number, status, eta, onTap }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    onClick={onTap}
    className="bg-white rounded-xl p-4 shadow-lg cursor-pointer hover:shadow-xl transition-shadow max-w-xs"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
        <span className="text-red-600 font-bold">AP</span>
      </div>
      <div>
        <p className="font-mono font-bold text-slate-900">{tracking_number}</p>
        <p className="text-xs text-slate-500">AirPak Express</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        status === 'delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
      }`}>
        {status}
      </span>
      <span className="text-sm text-slate-600">ETA: {eta}</span>
    </div>
  </motion.div>
);

// ============================================================================
// MAIN REAL-TIME P2P CHAT COMPONENT
// ============================================================================
interface RealTimeP2PChatProps {
  ticketId?: string;
  isAdmin?: boolean;
  className?: string;
}

export const RealTimeP2PChat: React.FC<RealTimeP2PChatProps> = ({
  ticketId = 'default_ticket',
  isAdmin = false,
  className = '',
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'ai'>('chat');
  const { messages, typingUsers, sendMessage, setTyping, markAsRead, currentUser } = useChatStore();

  // Mock current user
  useEffect(() => {
    // In real app, this would come from auth
    useChatStore.setState({
      currentUser: {
        id: 'user_123',
        name: 'John Doe',
        role: 'user',
      },
    });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) {
        useChatStore.setState({ messages: data.map(m => ({ ...m, status: 'read' })) });
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${ticketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `ticket_id=eq.${ticketId}`,
      }, (payload) => {
        const newMessage = payload.new as Message;
        useChatStore.setState((state) => ({
          messages: [...state.messages, { ...newMessage, status: 'read' }],
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  const handleTyping = (isTyping: boolean) => {
    setTyping(isTyping);
  };

  const handleEscalate = (trigger: 'human' | 'agent' | 'frustrated') => {
    // In real app, this would notify admins
    console.log('Escalation triggered:', trigger);
    sendMessage(`[System] Requesting ${trigger} support...`);
  };

  const handleInsertResponse = (response: string) => {
    sendMessage(response);
    setActiveTab('chat');
  };

  const quickActions = {
    track: 'Can you track my package APK123456789?',
    rate: 'What are your shipping rates?',
    claim: 'I need to file a shipping claim.',
    agent: 'Please connect me with a human agent.',
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">AP</span>
          </div>
          <div>
            <h3 className="font-bold text-white">AirPak Support</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-white/80">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Phone className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <Video className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Tabs (Admin Only) */}
      {isAdmin && (
        <div className="flex bg-slate-100">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'chat' ? 'bg-white text-red-600' : 'text-slate-600'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === 'ai' ? 'bg-white text-red-600' : 'text-slate-600'
            }`}
          >
            AI Co-Pilot
          </button>
        </div>
      )}

      {/* AI Co-Pilot Panel (Admin) */}
      {isAdmin && activeTab === 'ai' && (
        <AdminCoPilot onInsertResponse={handleInsertResponse} />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.sender_id === currentUser?.id}
            showAvatar={true}
          />
        ))}
        <TypingIndicatorBubble users={typingUsers} />
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <QuickActionChips onSelect={(action) => handleSend(quickActions[action as keyof typeof quickActions])} />

      {/* Escalation Triggers */}
      <AIEscalation onEscalate={handleEscalate} />

      {/* Input */}
      <MessageInput onSend={handleSend} onTyping={handleTyping} />
    </div>
  );
};

export default RealTimeP2PChat;