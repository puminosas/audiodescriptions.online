import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/responsive.css'; // Import responsive styles

// Load environment variables from window.env if available (for production)
if (typeof window !== 'undefined' && !window.env) {
  window.env = {};
  
  // Copy Vite environment variables to window.env
  Object.keys(import.meta.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      const envKey = key.replace('VITE_', '');
      window.env[envKey] = import.meta.env[key];
    }
  });
}

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
