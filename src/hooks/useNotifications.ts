import { useState, useEffect, useCallback } from 'react';
import { PushNotificationService } from '../features/notifications/PushNotificationService';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'alert' | 'update' | 'promotion';
  read: boolean;
  timestamp: Date;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    
    // Check if already subscribed
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub);
        });
      });
    }

    // Load history from local storage
    const history = localStorage.getItem('notificationHistory');
    if (history) {
      try {
        const parsed = JSON.parse(history).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (e) {
        console.error('Failed to parse notification history', e);
      }
    }
  }, []);

  // Update app badge when unread notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
      PushNotificationService.updateBadge(unreadCount);
    } else {
      PushNotificationService.clearBadge();
    }
    
    // Save to local storage
    localStorage.setItem('notificationHistory', JSON.stringify(notifications));
  }, [notifications]);

  const requestPermission = useCallback(async () => {
    const result = await PushNotificationService.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const subscribeToNotifications = useCallback(async () => {
    if (permission !== 'granted') {
      const newPermission = await requestPermission();
      if (newPermission !== 'granted') return false;
    }
    
    const subscription = await PushNotificationService.subscribe();
    setIsSubscribed(!!subscription);
    return !!subscription;
  }, [permission, requestPermission]);

  const unsubscribeFromNotifications = useCallback(async () => {
    const result = await PushNotificationService.unsubscribe();
    if (result) setIsSubscribed(false);
    return result;
  }, []);

  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      // Small beep sound using AudioContext
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('AudioContext not supported or blocked');
    }
  }, [soundEnabled]);

  const sendLocalNotification = useCallback((title: string, body: string, type: 'alert' | 'update' | 'promotion' = 'update') => {
    // Add to history
    const newNotification: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      type,
      read: false,
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show system notification
    PushNotificationService.sendLocalNotification(title, { body });
    
    // Play sound
    playNotificationSound();
  }, [playNotificationSound]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  }, []);

  const clearHistory = useCallback(() => {
    setNotifications([]);
    PushNotificationService.clearBadge();
  }, []);

  const getNotificationHistory = useCallback((filterType?: 'alert' | 'update' | 'promotion') => {
    if (filterType) {
      return notifications.filter(n => n.type === filterType);
    }
    return notifications;
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    permission,
    isSubscribed,
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendLocalNotification,
    markAsRead,
    markAllAsRead,
    clearHistory,
    getNotificationHistory
  };
}
