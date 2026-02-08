self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'confirm') {
        // User clicked the "Taken" button
        event.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
                // Check if there is already a window/tab open with the target URL
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    // If so, focus it.
                    if (client.url && 'focus' in client) {
                        client.postMessage({
                            type: 'MARK_TAKEN',
                            payload: event.notification.data
                        });
                        return client.focus();
                    }
                }
                // If not, open a new window
                if (self.clients.openWindow) {
                    return self.clients.openWindow('/').then(windowClient => {
                        if (windowClient) {
                            windowClient.postMessage({
                                type: 'MARK_TAKEN',
                                payload: event.notification.data
                            });
                        }
                    });
                }
            })
        );
    } else {
        // User clicked the notification body
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then((windowClients) => {
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (self.clients.openWindow) {
                    return self.clients.openWindow('/');
                }
            })
        );
    }
});
