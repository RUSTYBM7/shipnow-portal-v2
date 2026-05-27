/**
 * AirPak Express - iOS-style Toast Notifications
 * Stacked notifications with swipe-to-dismiss and deep linking
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Package, MessageCircle, Bell, AlertTriangle, CheckCircle, X,
  Truck, Clock, Settings, ChevronRight
} from 'lucide-react';
import { useNotificationStore } from '../store';
import type { Notification } from '../store';

interface ToastProps {
  maxVisible?: number;
}

const Toast: React.FC<ToastProps> = ({ maxVisible = 3 }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, removeNotification } = useNotificationStore();
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([]);

  // Show newest unread notifications
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).slice(0, maxVisible);
    setVisibleToasts(unread);
  }, [notifications, maxVisible]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'shipment_update':
        return Package;
      case 'support_message':
        return MessageCircle;
      case 'admin_alert':
        return AlertTriangle;
      case 'promotion':
        return Bell;
      default:
        return CheckCircle;
    }
  };

  const getIconBg = (type: Notification['type']) => {
    switch (type) {
      case 'shipment_update':
        return 'bg-blue-100';
      case 'support_message':
        return 'bg-green-100';
      case 'admin_alert':
        return 'bg-red-100';
      case 'promotion':
        return 'bg-purple-100';
      default:
        return 'bg-gray-100';
    }
  };

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Navigate based on type
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.shipmentId) {
      navigate(`/tracking/${notification.shipmentId}`);
    } else if (notification.ticketId) {
      navigate(`/support?ticket=${notification.ticketId}`);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return `${Math.floor(minutes / 1440)}d ago`;
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((notification, index) => (
          <ToastItem
            key={notification.id}
            notification={notification}
            index={index}
            onDismiss={() => removeNotification(notification.id)}
            onClick={() => handleClick(notification)}
            getIcon={getIcon}
            getIconBg={getIconBg}
            formatTime={formatTime}
          />
        ))}
      </AnimatePresence>

      {/* More notifications pill */}
      {notifications.filter(n => !n.read).length > maxVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="pointer-events-auto"
        >
          <button
            onClick={() => navigate('/notifications')}
            className="w-full bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 px-4 py-2 text-sm text-gray-600 flex items-center justify-center gap-2"
          >
            {notifications.filter(n => !n.read).length - maxVisible} more notifications
            <ChevronRight size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
};

interface ToastItemProps {
  notification: Notification;
  index: number;
  onDismiss: () => void;
  onClick: () => void;
  getIcon: (type: Notification['type']) => any;
  getIconBg: (type: Notification['type']) => string;
  formatTime: (date: Date) => string;
}

const ToastItem: React.FC<ToastItemProps> = ({
  notification,
  index,
  onDismiss,
  onClick,
  getIcon,
  getIconBg,
  formatTime,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const Icon = getIcon(notification.type);

  const handleDragEnd = (event: any, info: any) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Dismiss if dragged far enough or with enough velocity
    if (offset > 100 || velocity > 500) {
      onDismiss();
    } else {
      setDragOffset(0);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        x: 100,
        scale: 0.9,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
        delay: index * 0.05,
      }}
      style={{ zIndex: 100 - index }}
      className="pointer-events-auto"
      drag="x"
      dragConstraints={{ left: 0, right: 200 }}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDrag={(_, info) => setDragOffset(info.offset.x)}
      onDragEnd={handleDragEnd}
    >
      <div
        className={`
          bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50
          overflow-hidden cursor-pointer hover:bg-white transition-colors
          ${isDragging ? 'transition-none' : 'transition-all'}
        `}
        style={{
          transform: isDragging ? `translateX(${dragOffset}px)` : undefined,
          opacity: isDragging ? 1 - dragOffset / 200 : 1,
        }}
        onClick={() => !isDragging && onClick()}
      >
        <div className="flex items-start gap-3 p-4">
          {/* AirPak Icon */}
          <div className={`w-11 h-11 ${getIconBg(notification.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon size={22} className="text-gray-700" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-[15px] text-gray-900 leading-tight">
                {notification.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
                className="p-1 -mr-1 -mt-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-[13px] text-gray-600 mt-0.5 line-clamp-2">
              {notification.body}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              {formatTime(new Date(notification.timestamp))}
            </p>
          </div>
        </div>

        {/* Swipe hint */}
        {isDragging && dragOffset > 50 && (
          <div className="absolute right-0 top-0 bottom-0 bg-red-500 flex items-center justify-center px-4">
            <span className="text-white font-medium">Remove</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Toast;

// Notification bell with badge
export const NotificationBell: React.FC = () => {
  const { unreadCount, markAllAsRead } = useNotificationStore();

  return (
    <button
      onClick={markAllAsRead}
      className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#DC143C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};
