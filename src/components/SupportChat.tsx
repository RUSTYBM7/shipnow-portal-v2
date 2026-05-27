/**
 * AirPak Express - iMessage Style Support Chat
 * Real-time messaging with AI and human escalation
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Plus, Camera, Mic, ChevronLeft, X,
  Sparkles, User, MessageCircle, Phone, Bell,
  MessageSquare, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useChatStore, useNotificationStore, useUserStore } from '../store';
import { supabase } from '../lib/supabase';

interface SupportChatProps {
  onBack?: () => void;
  isFloating?: boolean;
}

type SenderType = 'user' | 'ai' | 'admin';

interface Message {
  id: string;
  content: string;
  senderType: SenderType;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

const SupportChat: React.FC<SupportChatProps> = ({ onBack, isFloating = false }) => {
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [aiEscalating, setAiEscalating] = useState(false);
  const [activeBanner, setActiveBanner] = useState<{title: string, message: string, action: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, addMessage, setTyping } = useChatStore();
  const { addNotification } = useNotificationStore();
  const { profile } = useUserStore();

  const currentMessages = ticketId ? messages[ticketId] || [] : [];

  // Context-aware quick actions
  const quickActions = [
    { id: 'track', label: 'Track my package', icon: Package },
    { id: 'invoice', label: 'Pay invoice', icon: Bell },
    { id: 'human', label: 'Talk to human', icon: Phone },
  ];

  // Proactive Triggers Simulation
  useEffect(() => {
    if (!isOpen && isFloating) {
      const timer = setTimeout(() => {
        setActiveBanner({
          title: 'Weather Delay Alert',
          message: 'Your shipment to Frankfurt might be delayed due to snow. Want to check status?',
          action: 'track'
        });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isFloating]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, isAiTyping, isOpen]);

  // Create initial ticket if none exists
  useEffect(() => {
    const initTicket = async () => {
      if (!ticketId && profile && isOpen) {
        try {
          const { data, error } = await supabase
            .from('support_tickets')
            .insert({
              user_id: profile.id,
              title: 'New Support Request',
              status: 'ai_handling',
              priority: 'medium',
              ai_handled: true,
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            setTicketId(data.id);
            addMessage(data.id, {
              ticketId: data.id,
              senderId: 'ai',
              senderType: 'ai',
              content: "Hi! I'm your AirPak AI assistant. How can I help you today? I can help with tracking, shipping rates, and general questions.",
            });
          }
        } catch (err) {
          console.error('Failed to initialize support ticket', err);
          toast.error('Failed to connect to support service. Please try again later.');
        }
      }
    };

    initTicket();
  }, [profile, ticketId, addMessage, isOpen]);

  // AI Response logic
  const getAIResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    const escalationTriggers = ['human', 'agent', 'real person', 'frustrated', 'angry', 'help me', 'not working'];
    const shouldEscalate = escalationTriggers.some(trigger => lowerMessage.includes(trigger));

    if (shouldEscalate) {
      setAiEscalating(true);
      setTimeout(() => {
        setAiEscalating(false);
        triggerEscalation('User requested human assistance');
      }, 2000);
      return "Connecting you with our AirPak logistics team now...";
    }

    if (lowerMessage.includes('track') || lowerMessage.includes('package')) {
      return "I can help you track your package! Please provide your tracking number (e.g., APK20240525001234), or I can look at your recent shipments if you're logged in.";
    }

    if (lowerMessage.includes('rate') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Our shipping rates depend on:\n• Origin & destination\n• Package weight & dimensions\n• Service level (Express, Standard, Economy)\n\nExpress (2-4 days): From $45\nStandard (5-10 days): From $25\nEconomy (10-20 days): From $15\n\nWould you like a quote for a specific shipment?";
    }

    if (lowerMessage.includes('custom') || lowerMessage.includes('duty') || lowerMessage.includes('tax')) {
      return "Customs duties and taxes vary by destination country. For UK shipments, VAT may apply. For international shipments, duties are determined by the destination country's customs regulations.\n\nFor specific customs information, please provide the destination country.";
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return `Hello${profile?.name ? ` ${profile.name.split(' ')[0]}` : ''}! 👋 I'm here to help with all your AirPak shipping needs. What can I assist you with today?`;
    }

    return "Thank you for your message! I can help with tracking, rates, customs info, and general shipping questions. What would you like to know?";
  };

  const triggerEscalation = async (reason: string) => {
    if (!ticketId) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'escalated',
          ai_handled: false,
          escalation_reason: reason,
        })
        .eq('id', ticketId);

      if (error) throw error;

      addNotification({
        type: 'admin_alert',
        title: 'New Escalation',
        body: `User needs assistance: ${reason}`,
        ticketId,
      });
    } catch (err) {
      console.error('Failed to escalate ticket', err);
      toast.error('Failed to connect to human agent. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !ticketId) return;

    const userMessage = inputText.trim();
    setInputText('');

    addMessage(ticketId, {
      ticketId,
      senderId: profile?.id || 'user',
      senderType: 'user',
      content: userMessage,
    });

    setIsAiTyping(true);

    setTimeout(async () => {
      const response = await getAIResponse(userMessage);
      setIsAiTyping(false);

      addMessage(ticketId, {
        ticketId,
        senderId: 'ai',
        senderType: 'ai',
        content: response,
      });
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'human') {
      setShowEscalationModal(true);
      setInputText('I need to speak with a human agent please.');
    } else if (actionId === 'track') {
      setInputText('I want to track my package.');
    } else if (actionId === 'invoice') {
      setInputText('I need to pay my invoice.');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const chatContent = (
    <div className={`flex flex-col bg-white overflow-hidden ${isFloating ? 'h-[500px] w-[350px] shadow-2xl rounded-2xl border border-gray-200' : 'h-full w-full rounded-2xl border border-gray-200'}`}>
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white">
        {onBack && !isFloating && (
          <button onClick={onBack} className="p-2 -ml-2 text-[#DC143C]">
            <ChevronLeft size={28} />
          </button>
        )}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-semibold">AirPak Support</span>
            <Sparkles size={14} className="text-[#DC143C]" />
          </div>
          <span className="text-[13px] text-green-500 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            {isAiTyping ? 'AI is typing...' : 'AI Assistant'}
          </span>
        </div>
        {(isFloating || onBack) && (
          <button onClick={() => isFloating ? setIsOpen(false) : onBack?.()} className="p-2 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F8F8F8]">
        <AnimatePresence>
          {currentMessages.map((msg: any, i) => (
            <motion.div
              key={msg.id || i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex w-full ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col max-w-[80%] ${msg.senderType === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.senderType === 'admin' && (
                  <span className="text-xs text-green-600 font-medium mb-1 ml-1 flex items-center gap-1">
                    <User size={10} /> AirPak Staff
                  </span>
                )}

                <div
                  className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-line ${
                    msg.senderType === 'user'
                      ? 'bg-[#DC143C] text-white rounded-br-md'
                      : msg.senderType === 'admin'
                        ? 'bg-green-500 text-white rounded-br-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                  }`}
                >
                  {msg.content}
                </div>

                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[11px] text-gray-400">
                    {formatTime(new Date(msg.timestamp))}
                  </span>
                  {msg.senderType === 'user' && (
                    <span className="text-[11px] text-gray-400">
                      {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isAiTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{
                        y: [0, -4, 0],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap hover:bg-gray-200 transition-colors"
            >
              <action.icon size={12} />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2 px-3 py-3 bg-white border-t border-gray-200">
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
          <Plus size={22} />
        </button>
        <div className="flex-1 bg-gray-100 rounded-3xl px-4 py-2.5">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message AI Concierge..."
            className="w-full bg-transparent text-[15px] outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
        </div>
        {inputText.trim() ? (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={sendMessage}
            className="p-2 bg-[#DC143C] text-white rounded-full"
          >
            <Send size={20} />
          </motion.button>
        ) : (
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            <Mic size={22} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showEscalationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4 rounded-2xl"
            onClick={() => setShowEscalationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-[280px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User size={32} className="text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold">Connecting to Agent</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Please hold while we connect you with an AirPak staff member...
                </p>
              </div>
              <button
                onClick={() => setShowEscalationModal(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  if (!isFloating) return chatContent;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {activeBanner && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-[300px] cursor-pointer"
            onClick={() => {
              setIsOpen(true);
              handleQuickAction(activeBanner.action);
              setActiveBanner(null);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <Sparkles className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{activeBanner.title}</h4>
                <p className="text-xs text-gray-500 leading-snug">{activeBanner.message}</p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveBanner(null);
                }}
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 origin-bottom-right"
          >
            {chatContent}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-[#DC143C] text-white p-4 rounded-full shadow-lg shadow-red-500/30"
          onClick={() => setIsOpen(true)}
        >
          {/* Pulse effect */}
          <span className="absolute inset-0 rounded-full animate-ping bg-[#DC143C] opacity-20"></span>
          <MessageSquare size={28} />
        </motion.button>
      )}
    </div>
  );
};

export default SupportChat;
