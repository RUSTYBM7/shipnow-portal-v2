export class PushNotificationService {
  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notification');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  static async subscribe(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return existingSubscription;
      }

      // VAPID public key should come from environment or server
      const publicVapidKey = 'BJThIGTexs1tR5lsL9l6U706Q8eH2qLz3k_hT5U-wA8zN-kZfDk1Z8fIuS-RkE2Y-T_E5Z5Z5Z5Z5Z5Z5Z5Z5Z8'; 
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicVapidKey)
      });
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  static async unsubscribe(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        return await subscription.unsubscribe();
      }
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  static sendLocalNotification(title: string, options?: NotificationOptions) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            icon: '/apple-touch-icon.png',
            ...options
          });
        });
      } else {
        new Notification(title, {
          icon: '/apple-touch-icon.png',
          ...options
        });
      }
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  static updateBadge(count: number) {
    if ('setAppBadge' in navigator) {
      try {
        (navigator as any).setAppBadge(count);
      } catch (error) {
        console.error('Failed to update app badge:', error);
      }
    }
  }

  static clearBadge() {
    if ('clearAppBadge' in navigator) {
      try {
        (navigator as any).clearAppBadge();
      } catch (error) {
        console.error('Failed to clear app badge:', error);
      }
    }
  }

  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
