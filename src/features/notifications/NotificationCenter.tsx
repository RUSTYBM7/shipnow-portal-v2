import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, BellRing, Trash2, Check, X, Filter, Volume2, VolumeX, AlertTriangle, Info, Tag } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'alert' | 'update' | 'promotion'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    permission,
    isSubscribed,
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendLocalNotification,
    markAsRead,
    markAllAsRead,
    clearHistory
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === filter);

  const getIconForType = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'update': return <Info className="h-5 w-5 text-blue-500" />;
      case 'promotion': return <Tag className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleTestNotification = () => {
    const types: ('alert' | 'update' | 'promotion')[] = ['alert', 'update', 'promotion'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let title = 'New Notification';
    let body = 'This is a test notification';
    
    if (type === 'alert') {
      title = 'Shipment Delayed';
      body = 'Your package #123456 has been delayed due to weather.';
    } else if (type === 'update') {
      title = 'Status Update';
      body = 'Your package #789012 is out for delivery.';
    } else {
      title = 'Special Offer';
      body = 'Get 20% off your next international shipment!';
    }
    
    sendLocalNotification(title, body, type);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-200 transition-colors"
                  title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button 
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Mark all as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Permissions & Push Toggle */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                {isSubscribed ? (
                  <><BellRing className="h-4 w-4 text-green-500" /> Push Enabled</>
                ) : (
                  <><BellOff className="h-4 w-4 text-gray-400" /> Push Disabled</>
                )}
              </div>
              <button
                onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                  isSubscribed 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {isSubscribed ? 'Disable' : 'Enable'}
              </button>
            </div>

            {/* Filters */}
            <div className="flex border-b border-gray-100">
              {(['all', 'alert', 'update', 'promotion'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 text-xs font-medium text-center transition-colors ${
                    filter === f 
                      ? 'border-b-2 border-blue-600 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No notifications found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filteredNotifications.map(notification => (
                    <li 
                      key={notification.id} 
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getIconForType(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className={`text-sm mt-0.5 ${!notification.read ? 'text-gray-600' : 'text-gray-500'}`}>
                            {notification.body}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Intl.DateTimeFormat('en-US', {
                              hour: 'numeric', minute: 'numeric', 
                              month: 'short', day: 'numeric'
                            }).format(notification.timestamp)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full mt-1.5" />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 flex justify-between items-center">
              <button
                onClick={clearHistory}
                disabled={notifications.length === 0}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-3 w-3" /> Clear All
              </button>
              
              {/* Developer Test Button - Remove in production */}
              <button
                onClick={handleTestNotification}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Test Notification
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
