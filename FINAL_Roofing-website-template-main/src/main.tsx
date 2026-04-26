import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { brandConfig } from './brandConfig';

const root = document.documentElement;
root.style.setProperty('--color-primary', brandConfig.primaryColor);
root.style.setProperty('--color-background', brandConfig.backgroundColor);
root.style.setProperty('--color-surface', brandConfig.surfaceColor);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
