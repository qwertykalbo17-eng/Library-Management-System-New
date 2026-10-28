import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './theme';
import { MAINTENANCE_MODE } from './config';
import { MaintenancePage } from './pages/MaintenancePage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {MAINTENANCE_MODE ? <MaintenancePage /> : <App />}
  </StrictMode>
);