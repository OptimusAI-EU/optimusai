
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Determine basename based on current location
const getBasename = () => {
  if (typeof window !== 'undefined') {
    // If on GitHub Pages, use /optimusai, otherwise use /
    return window.location.hostname.includes('github.io') ? '/optimusai' : '/';
  }
  return '/';
};

root.render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
