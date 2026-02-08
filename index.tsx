import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AdminApp } from './AdminApp';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const Root = () => {
  // Use state for navigation instead of window.location to avoid reloading/crashing in preview
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <React.StrictMode>
      {isAdmin ? (
        <AdminApp onBack={() => setIsAdmin(false)} />
      ) : (
        <App onOpenAdmin={() => setIsAdmin(true)} />
      )}
    </React.StrictMode>
  );
};

const root = ReactDOM.createRoot(rootElement);
root.render(<Root />);