
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
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
      const notification = new Notification(title, {
        body: body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png', // App Icon
        badge: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png',
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
