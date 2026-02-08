
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

export const sendLocalNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    // Check if we are on mobile service worker context (for advanced PWAs) or simple client
    try {
      // Standard notification
      // Note: On Mobile Safari, this only works if the app is installed to Home Screen
      const notification = new Notification(title, {
        body: body,
        icon: '/pwa-192x192.png', // Assuming you have PWA icons (using placeholder or path from manifest)
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        requireInteraction: true, // Keeps notification on screen until user interacts
      } as any);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.error("Notification error:", e);
    }
  }
};
