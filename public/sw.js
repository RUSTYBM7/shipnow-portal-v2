/**
 * AirPak Express - Advanced Service Worker
 * PWA with Background Sync, IndexedDB, Push Notifications, and Install Prompt
 * Version: 4.0.0
 */

const CACHE_NAME = 'airpak-v4';
const OFFLINE_URL = '/offline.html';
const DB_NAME = 'airpak-offline';
const DB_VERSION = 1;

// IndexedDB stores
const STORES = {
  PENDING_OPERATIONS: 'pending_operations',
  CACHED_SHIPMENTS: 'cached_shipments',
  NOTIFICATION_HISTORY: 'notification_history',
  USER_PREFERENCES: 'user_preferences'
};

// API endpoints for background sync
const API_ENDPOINTS = {
  SHIPMENTS: '/rest/v1/shipments',
  PROFILE: '/rest/v1/profiles',
  NOTIFICATIONS: '/rest/v1/notifications'
};

// Initialize IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Pending operations store (for background sync)
      if (!db.objectStoreNames.contains(STORES.PENDING_OPERATIONS)) {
        const opStore = db.createObjectStore(STORES.PENDING_OPERATIONS, { keyPath: 'id', autoIncrement: true });
        opStore.createIndex('type', 'type', { unique: false });
        opStore.createIndex('timestamp', 'timestamp', { unique: false });
        opStore.createIndex('status', 'status', { unique: false });
      }

      // Cached shipments store
      if (!db.objectStoreNames.contains(STORES.CACHED_SHIPMENTS)) {
        const shipmentStore = db.createObjectStore(STORES.CACHED_SHIPMENTS, { keyPath: 'id' });
        shipmentStore.createIndex('tracking_number', 'tracking_number', { unique: true });
        shipmentStore.createIndex('updated_at', 'updated_at', { unique: false });
      }

      // Notification history
      if (!db.objectStoreNames.contains(STORES.NOTIFICATION_HISTORY)) {
        const notifStore = db.createObjectStore(STORES.NOTIFICATION_HISTORY, { keyPath: 'id' });
        notifStore.createIndex('timestamp', 'timestamp', { unique: false });
        notifStore.createIndex('read', 'read', { unique: false });
      }

      // User preferences
      if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
        db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'key' });
      }
    };
  });
}

// Database helper functions
async function dbOperation(storeName, mode, operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addPendingOperation(operation) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
    const store = tx.objectStore(STORES.PENDING_OPERATIONS);
    const request = store.add({
      ...operation,
      timestamp: Date.now(),
      status: 'pending',
      retries: 0
    });

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getPendingOperations() {
  return dbOperation(STORES.PENDING_OPERATIONS, 'readonly', (store) => store.getAll());
}

async function removePendingOperation(id) {
  return dbOperation(STORES.PENDING_OPERATIONS, 'readwrite', (store) => store.delete(id));
}

async function updatePendingOperation(id, updates) {
  return dbOperation(STORES.PENDING_OPERATIONS, 'readwrite', (store) => {
    return store.get(id).then((op) => {
      if (op) {
        const updated = { ...op, ...updates };
        return store.put(updated);
      }
    });
  });
}

// Cache management
async function cacheShipment(shipment) {
  return dbOperation(STORES.CACHED_SHIPMENTS, 'readwrite', (store) => {
    return store.put({
      ...shipment,
      cached_at: Date.now()
    });
  });
}

async function getCachedShipment(trackingNumber) {
  return dbOperation(STORES.CACHED_SHIPMENTS, 'readonly', (store) => {
    return store.index('tracking_number').get(trackingNumber);
  });
}

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v4.0...');

  // Precache essential resources
  const precacheResources = [
    '/',
    '/index.html',
    '/manifest.json',
    '/pwa-192x192.png',
    '/pwa-512x512.png',
    '/apple-touch-icon.png',
    '/offline.html'
  ];

  event.waitUntil(
    Promise.all([
      // Open database
      openDatabase(),
      // Cache resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Precaching resources');
        return cache.addAll(precacheResources).catch(err => {
          console.log('[SW] Some resources failed to cache:', err);
        });
      })
    ]).then(() => {
      console.log('[SW] Service worker installed');
      self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v4.0...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('airpak-') && name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service worker activated');
      // Notify clients about activation
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: '4.0.0'
          });
        });
      });
    })
  );
});

// Fetch event - Network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests except for API calls
  if (request.method !== 'GET' && !url.pathname.includes('/functions/v1/')) {
    return;
  }

  // Skip non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Handle API requests - Network first with offline queue
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/functions/v1/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET responses
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });

            // Cache shipment data in IndexedDB
            if (url.pathname.includes('/shipments')) {
              response.clone().json().then(data => {
                if (Array.isArray(data)) {
                  data.forEach(shipment => cacheShipment(shipment));
                }
              }).catch(() => {});
            }
          }
          return response;
        })
        .catch(async () => {
          // Try cache first
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Try IndexedDB for shipments
          if (url.pathname.includes('/rest/v1/shipments')) {
            const trackingMatch = url.search.match(/tracking_number=eq\.([^&]+)/);
            if (trackingMatch) {
              const cachedShipment = await getCachedShipment(trackingMatch[1]);
              if (cachedShipment) {
                return new Response(JSON.stringify(cachedShipment), {
                  status: 200,
                  headers: { 'Content-Type': 'application/json' }
                });
              }
            }
          }

          // Return offline response
          return new Response(
            JSON.stringify({ error: 'offline', message: 'No cached response available' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // Handle map tiles - Cache first
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('maps.wikimedia.org')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Handle other requests - Stale while revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return response;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});

// Background sync - Process pending operations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  const syncHandlers = {
    'sync-pending-operations': () => processPendingOperations(),
    'sync-shipments': () => syncShipments(),
    'sync-notifications': () => checkNewNotifications(),
    'sync-profile': () => syncProfile()
  };

  const handler = syncHandlers[event.tag];
  if (handler) {
    event.waitUntil(handler());
  }
});

async function processPendingOperations() {
  console.log('[SW] Processing pending operations...');

  const operations = await getPendingOperations();
  console.log(`[SW] Found ${operations.length} pending operations`);

  for (const op of operations) {
    try {
      let result;

      switch (op.type) {
        case 'create_shipment':
          result = await fetch(API_ENDPOINTS.SHIPMENTS, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': self.APP_KEY || '',
              'Authorization': `Bearer ${op.token || ''}`
            },
            body: JSON.stringify(op.data)
          });
          break;

        case 'update_profile':
          result = await fetch(`${API_ENDPOINTS.PROFILE}/${op.userId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': self.APP_KEY || '',
              'Authorization': `Bearer ${op.token || ''}`
            },
            body: JSON.stringify(op.data)
          });
          break;

        case 'mark_notification_read':
          result = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}/${op.notificationId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': self.APP_KEY || '',
              'Authorization': `Bearer ${op.token || ''}`
            },
            body: JSON.stringify({ is_read: true, read_at: new Date().toISOString() })
          });
          break;

        default:
          console.log('[SW] Unknown operation type:', op.type);
      }

      // Remove successful operation
      await removePendingOperation(op.id);

      // Notify client
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SYNC_COMPLETE',
            operationId: op.id,
            success: true
          });
        });
      });

    } catch (error) {
      console.error('[SW] Failed to sync operation:', error);

      // Update retry count
      const retries = (op.retries || 0) + 1;
      if (retries < 5) {
        await updatePendingOperation(op.id, { retries });
        // Schedule retry with exponential backoff
        self.registration.sync.register(`retry-${op.id}`);
      } else {
        // Max retries reached, notify failure
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_FAILED',
              operationId: op.id,
              error: error.message
            });
          });
        });
        await removePendingOperation(op.id);
      }
    }
  }
}

async function syncShipments() {
  console.log('[SW] Syncing shipments...');
  // Implementation for syncing shipment data
}

async function checkNewNotifications() {
  console.log('[SW] Checking for new notifications...');
  // Implementation for checking notifications
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  if (!event.data) {
    console.log('[SW] No data in push notification');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'AirPak Express', body: event.data.text() };
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: '/pwa-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100, 50, 100],
    sound: '/notification-sound.mp3',
    tag: data.tag || 'airpak-notification',
    renotify: true,
    requireInteraction: data.require_interaction || false,
    data: {
      url: data.deep_link || '/',
      tracking_number: data.tracking_number,
      notification_id: data.id,
      timestamp: Date.now(),
      type: data.type || 'general'
    },
    actions: getNotificationActions(data.type),
    headers: {
      'X-Notification-Type': data.type || 'general'
    }
  };

  // Add image for rich notifications
  if (data.image) {
    options.image = data.image;
  }

  event.waitUntil(
    Promise.all([
      // Show notification
      self.registration.showNotification(data.title || 'AirPak Express', options),
      // Store notification in IndexedDB
      storeNotificationHistory(data)
    ])
  );
});

function getNotificationActions(type) {
  const baseActions = [
    { action: 'view', title: 'View Details' },
    { action: 'dismiss', title: 'Dismiss' }
  ];

  const typeActions = {
    shipment_update: [
      { action: 'track', title: 'Track' },
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    delivery: [
      { action: 'confirm', title: 'Confirm Receipt' },
      { action: 'report', title: 'Report Issue' }
    ],
    promotion: [
      { action: 'shop', title: 'Shop Now' },
      { action: 'later', title: 'Remind Later' }
    ]
  };

  return typeActions[type] || baseActions;
}

async function storeNotificationHistory(notification) {
  try {
    return dbOperation(STORES.NOTIFICATION_HISTORY, 'readwrite', (store) => {
      return store.put({
        id: notification.id || `notif-${Date.now()}`,
        ...notification,
        timestamp: Date.now(),
        read: false
      });
    });
  } catch (error) {
    console.error('[SW] Failed to store notification:', error);
  }
}

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  const actionHandlers = {
    track: () => {
      const trackingNumber = event.notification.data?.tracking_number;
      return `/#/tracking?tn=${trackingNumber}`;
    },
    view: () => event.notification.data?.url || '/',
    confirm: () => '/#/delivery-confirm',
    report: () => '/#/report-issue',
    shop: () => '/#/promotions',
    dismiss: () => null,
    default: () => event.notification.data?.url || '/'
  };

  const url = actionHandlers[event.action]?.() || actionHandlers.default();

  if (!url) return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});

// Notification close handling
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
  // Analytics or cleanup
});

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  const messageHandlers = {
    SKIP_WAITING: () => self.skipWaiting(),

    GET_VERSION: () => {
      event.ports[0]?.postMessage({ version: '4.0.0', cache: CACHE_NAME });
    },

    CLEAR_CACHE: () => {
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
    },

    GET_CACHE_STATUS: () => {
      caches.open(CACHE_NAME).then(cache => {
        cache.keys().then(keys => {
          event.ports[0]?.postMessage({
            cacheName: CACHE_NAME,
            cachedResources: keys.length
          });
        });
      });
    },

    QUEUE_OPERATION: async () => {
      const { operation } = event.data;
      const id = await addPendingOperation(operation);

      // Request background sync
      if ('sync' in self.registration) {
        await self.registration.sync.register('sync-pending-operations');
      }

      event.ports[0]?.postMessage({ queued: true, operationId: id });
    },

    SUBSCRIBE_PUSH: async () => {
      try {
        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: event.data.vapidKey
        });

        event.ports[0]?.postMessage({
          subscription: subscription.toJSON()
        });
      } catch (error) {
        event.ports[0]?.postMessage({ error: error.message });
      }
    },

    GET_PENDING_COUNT: async () => {
      const operations = await getPendingOperations();
      event.ports[0]?.postMessage({ pendingCount: operations.length });
    },

    SET_USER_PREFERENCES: async () => {
      const { key, value } = event.data;
      await dbOperation(STORES.USER_PREFERENCES, 'readwrite', (store) => {
        return store.put({ key, value, updated: Date.now() });
      });
      event.ports[0]?.postMessage({ success: true });
    },

    GET_USER_PREFERENCES: async () => {
      const prefs = await dbOperation(STORES.USER_PREFERENCES, 'readonly', (store) => store.getAll());
      event.ports[0]?.postMessage({ preferences: prefs });
    }
  };

  const handler = messageHandlers[event.data.type];
  if (handler) {
    handler();
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);

  if (event.tag === 'check-updates') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  console.log('[SW] Checking for app updates...');
  // Check manifest for updates
  const response = await fetch('/manifest.json');
  if (response.ok) {
    const manifest = await response.json();
    // Could trigger update if needed
  }
}

// Navigation preload (if supported)
self.addEventListener('navigationpreload', (event) => {
  if (event.preloadState) {
    console.log('[SW] Navigation preload enabled');
  }
});

// Extendable Service Worker API
self.addEventListener('extendablemessage', (event) => {
  console.log('[SW] Extendable message:', event.data);

  if (event.extendedMessage) {
    // Handle extended protocol messages
    switch (event.data.protocol) {
      case 'update-fetch':
        // Custom fetch with update notification
        break;
      case 'cache-control':
        // Custom cache control messages
        break;
    }
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

// Install prompt handling (for custom install UI)
let deferredPrompt = null;

self.addEventListener('beforeinstallprompt', (event) => {
  console.log('[SW] Before install prompt');

  // Prevent default prompt
  event.preventDefault();

  // Store for later use
  deferredPrompt = event;

  // Notify clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'INSTALL_PROMPT_AVAILABLE',
        platforms: event.platforms,
        isExternal: event.isExternal
      });
    });
  });

  // Don't prevent default - allow browser prompt
  return false;
});

// App installed event
self.addEventListener('appinstalled', (event) => {
  console.log('[SW] App installed');

  // Notify clients
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'APP_INSTALLED',
        platform: event.platform
      });
    });
  });

  // Clear deferred prompt
  deferredPrompt = null;
});

// Export for module usage
export { CACHE_NAME, openDatabase, addPendingOperation, getPendingOperations };