/**
 * Advanced PWA Hook
 * Handles PWA installation, background sync, offline support, and install tracking
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Type declarations for extended Window
declare global {
  interface Window {
    installPWA?: () => Promise<boolean>;
    trackPWAInstall?: (platform: string) => void;
  }

  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
}

export interface PWADeviceInfo {
  os: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
  browser: string;
  isMobile: boolean;
  isTablet: boolean;
  supportsPush: boolean;
  supportsBackgroundSync: boolean;
  supportsInstallPrompt: boolean;
}

export interface PWAInstallPrompt {
  canInstall: boolean;
  platform: string;
  isExternal: boolean;
  deferredPrompt: any | null;
}

export interface PWAInstallMetrics {
  installDate: string | null;
  sessionsCount: number;
  lastActive: string | null;
  pushSubscribed: boolean;
  notificationsEnabled: boolean;
}

export interface PendingOperation {
  id: number;
  type: 'create_shipment' | 'update_profile' | 'mark_notification_read';
  data: any;
  timestamp: number;
  retries: number;
}

export function usePWA() {
  const [deviceInfo, setDeviceInfo] = useState<PWADeviceInfo>({
    os: 'unknown',
    browser: 'unknown',
    isMobile: false,
    isTablet: false,
    supportsPush: false,
    supportsBackgroundSync: false,
    supportsInstallPrompt: false
  });

  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt>({
    canInstall: false,
    platform: '',
    isExternal: false,
    deferredPrompt: null
  });

  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [swVersion, setSwVersion] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [metrics, setMetrics] = useState<PWAInstallMetrics>({
    installDate: null,
    sessionsCount: 0,
    lastActive: null,
    pushSubscribed: false,
    notificationsEnabled: false
  });

  const swRegistration = useRef<ServiceWorkerRegistration | null>(null);

  // Initialize device info and check capabilities
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();

    let os: PWADeviceInfo['os'] = 'unknown';
    let isMobile = /mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua);
    let isTablet = /tablet|ipad|playbook|kindle|silk/i.test(ua);

    if (/iphone|ipad|ipod/i.test(ua)) {
      os = 'ios';
    } else if (/android/i.test(ua)) {
      os = 'android';
    } else if (/windows/i.test(ua)) {
      os = 'windows';
    } else if (/mac os|macintosh/i.test(ua)) {
      os = 'macos';
    } else if (/linux/i.test(ua)) {
      os = 'linux';
    }

    let browser = 'unknown';
    if (/chrome|crios|cros/i.test(ua)) browser = 'chrome';
    else if (/safari|applewebkit/i.test(ua)) browser = 'safari';
    else if (/firefox|fxios/i.test(ua)) browser = 'firefox';
    else if (/edge|edg/i.test(ua)) browser = 'edge';

    const supportsPush = 'serviceWorker' in navigator && 'PushManager' in window;
    const supportsBackgroundSync = 'serviceWorker' in navigator && 'SyncManager' in window;
    const supportsInstallPrompt = 'onbeforeinstallprompt' in window;

    setDeviceInfo({
      os,
      browser,
      isMobile,
      isTablet,
      supportsPush,
      supportsBackgroundSync,
      supportsInstallPrompt
    });

    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    } else if ((navigator as any).standalone !== undefined) {
      setIsInstalled((navigator as any).standalone);
    }

    // Check for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service worker registration and management
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        swRegistration.current = registration;

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });

        // Get SW version
        registration.active?.postMessage({ type: 'GET_VERSION' });

        navigator.serviceWorker.addEventListener('message', (event) => {
          handleSWMessage(event.data);
        });

        // Get pending operations count
        registration.active?.postMessage({ type: 'GET_PENDING_COUNT' });

      } catch (error) {
        console.error('SW registration failed:', error);
      }
    };

    registerSW();
  }, []);

  // Handle install prompt
  useEffect(() => {
    if (!deviceInfo.supportsInstallPrompt) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      const deferredPrompt = e as any;
      setInstallPrompt({
        canInstall: true,
        platform: deferredPrompt.platform || 'web',
        isExternal: deferredPrompt.isExternal || false,
        deferredPrompt
      });
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(prev => ({ ...prev, canInstall: false, deferredPrompt: null }));

      // Track installation
      if (window.trackPWAInstall) {
        window.trackPWAInstall('web');
      }

      // Send to backend
      trackInstallation('web');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deviceInfo.supportsInstallPrompt]);

  // Handle SW messages
  const handleSWMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'SW_ACTIVATED':
        setSwVersion(data.version);
        break;
      case 'SYNC_COMPLETE':
        // Update pending count
        setPendingCount(prev => Math.max(0, prev - 1));
        break;
      case 'SYNC_FAILED':
        console.error('Sync failed:', data.error);
        break;
      case 'PENDING_COUNT':
        setPendingCount(data.count || 0);
        break;
      case 'UPDATE_AVAILABLE':
        setUpdateAvailable(true);
        break;
    }
  }, []);

  // Install PWA
  const installPWA = useCallback(async (): Promise<boolean> => {
    if (!installPrompt.deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      const result = await installPrompt.deferredPrompt.prompt();
      console.log('Install result:', result.outcome);

      // Track based on platform
      const platform = detectPlatform();
      trackInstallation(platform);

      setInstallPrompt(prev => ({ ...prev, canInstall: false, deferredPrompt: null }));
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Install failed:', error);
      return false;
    }
  }, [installPrompt.deferredPrompt]);

  // Dismiss install prompt
  const dismissInstallPrompt = useCallback(() => {
    setInstallPrompt(prev => ({ ...prev, canInstall: false, deferredPrompt: null }));
    // Could store in localStorage to not show again
    localStorage.setItem('pwaInstallDismissed', Date.now().toString());
  }, []);

  // Apply SW update
  const applyUpdate = useCallback(() => {
    if (swRegistration.current?.waiting) {
      swRegistration.current.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
      window.location.reload();
    }
  }, []);

  // Queue operation for background sync
  const queueOperation = useCallback(async (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retries'>) => {
    if (!swRegistration.current) return false;

    try {
      swRegistration.current.active?.postMessage({
        type: 'QUEUE_OPERATION',
        operation: {
          type: operation.type,
          data: operation.data
        }
      });

      setPendingCount(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Failed to queue operation:', error);
      return false;
    }
  }, []);

  // Request background sync
  const requestSync = useCallback(async (tag: string = 'sync-pending-operations') => {
    if (!swRegistration.current) return false;

    try {
      await swRegistration.current.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Sync registration failed:', error);
      return false;
    }
  }, []);

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async (vapidKey?: string) => {
    if (!deviceInfo.supportsPush) {
      console.log('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey ? urlBase64ToUint8Array(vapidKey) : undefined
      });

      // Send subscription to backend
      const response = await fetch('https://zygoqqsgzhgpvlpttfbk.supabase.co/functions/v1/pwa-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys
        })
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }, [deviceInfo.supportsPush]);

  // Get installation metrics from backend
  const loadMetrics = useCallback(async () => {
    try {
      const response = await fetch('https://zygoqqsgzhgpvlpttfbk.supabase.co/functions/v1/pwa-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'metrics' })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.metrics && data.metrics.length > 0) {
          const latest = data.metrics[0];
          setMetrics({
            installDate: latest.install_date,
            sessionsCount: latest.sessions_count,
            lastActive: latest.last_active,
            pushSubscribed: latest.push_subscribed,
            notificationsEnabled: latest.notifications_enabled
          });
        }
      }
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(async () => {
    if (!swRegistration.current) return false;

    try {
      swRegistration.current.active?.postMessage({ type: 'CLEAR_CACHE' });
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }, []);

  // Store preferences locally
  const setPreference = useCallback(async (key: string, value: any) => {
    if (!swRegistration.current) return;

    swRegistration.current.active?.postMessage({
      type: 'SET_USER_PREFERENCES',
      key,
      value
    });
  }, []);

  // Helper to detect platform
  const detectPlatform = (): string => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
    if (/android/i.test(ua)) return 'android';
    if (/windows/i.test(ua)) return 'windows';
    if (/mac os|macintosh/i.test(ua)) return 'macos';
    return 'web';
  };

  // Track installation to backend
  const trackInstallation = async (platform: string) => {
    try {
      await fetch('https://zygoqqsgzhgpvlpttfbk.supabase.co/functions/v1/pwa-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'install',
          platform,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to track installation:', error);
    }
  };

  // Export/install PWA function globally
  useEffect(() => {
    (window as any).installPWA = installPWA;
    (window as any).trackPWAInstall = trackInstallation;

    return () => {
      delete (window as any).installPWA;
      delete (window as any).trackPWAInstall;
    };
  }, [installPWA]);

  return {
    // Device info
    deviceInfo,
    isInstalled,
    isOnline,
    swVersion,

    // Install prompt
    installPrompt,
    updateAvailable,
    installPWA,
    dismissInstallPrompt,
    applyUpdate,

    // Sync and operations
    pendingCount,
    queueOperation,
    requestSync,

    // Notifications
    subscribeToPush,

    // Metrics
    metrics,
    loadMetrics,

    // Utilities
    clearCache,
    setPreference,
    refreshPendingCount: () => swRegistration.current?.active?.postMessage({ type: 'GET_PENDING_COUNT' })
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePWA;