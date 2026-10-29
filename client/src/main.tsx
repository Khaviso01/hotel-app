import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

/**
 * Client entry point for rendering the root React component tree.
 * Mounts the main App component into the HTML root element under React.StrictMode.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);