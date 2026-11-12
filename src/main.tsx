import { StrictMode } from 'react';
import { createRoot }  from 'react-dom/client';
import { Amplify }     from 'aws-amplify';
import outputs         from '../amplify_outputs.json';
import './index.css';
import App from './App.tsx';
import { registerServiceWorker } from './utils/reminders';

// Configure Amplify with the deployed backend outputs before the app renders.
// When amplify_outputs.json has real values (after `npx ampx sandbox` or a
// branch deployment), this activates AppSync/DynamoDB. The db.ts layer detects
// whether the config is real and falls back to localStorage automatically.
try {
  const url: string = (outputs as any)?.data?.url ?? '';
  if (url && !url.startsWith('REPLACE')) {
    Amplify.configure(outputs as any);
  }
} catch {
  // Non-fatal — db.ts will fall back to localStorage
}

// Register the service worker for push notifications
registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
