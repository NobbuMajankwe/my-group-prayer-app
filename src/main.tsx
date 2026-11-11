import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { registerServiceWorker } from './utils/reminders';

// Register the service worker for push notifications
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
