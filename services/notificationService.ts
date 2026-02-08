
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return false;
  }

  // Check for Secure Context (HTTPS or localhost)
  if (!window.isSecureContext) {
    console.warn("Notifications require a secure context (HTTPS)");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};


export const sendLocalNotification = async (title: string, body: string, dataPayload?: any) => {
  if (Notification.permission === 'granted') {
    // Use Service Worker if available for actionable notifications
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body: body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          vibrate: [200, 100, 200],
          requireInteraction: true,
          data: dataPayload, // Pass dose ID here
          actions: [
            { action: 'confirm', title: '✅ I took it', icon: '/pwa-192x192.png' },
            { action: 'close', title: 'Start App', icon: '/pwa-192x192.png' }
          ]
        } as any);
      } catch (e) {
        console.error("SW Notification failed", e);
        // Fallback to standard
        fallbackNotification(title, body);
      }
    } else {
      fallbackNotification(title, body);
    }
  }
};

const fallbackNotification = (title: string, body: string) => {
  try {
    const notification = new Notification(title, {
      body: body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
    } as any);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (e) {
    console.error("Notification error:", e);
  }
}
