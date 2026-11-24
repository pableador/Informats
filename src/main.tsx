import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { NavigationProvider } from './context/NavigationContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <NavigationProvider>
        <App />
      </NavigationProvider>
    </AccessibilityProvider>
  </React.StrictMode>
);
