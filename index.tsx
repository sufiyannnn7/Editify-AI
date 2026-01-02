
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix for process.env not being defined in pure browser ESM environments
// Adding type casting to 'any' to resolve the 'Property process does not exist on type Window' error
if (typeof window !== 'undefined' && !(window as any).process) {
  // @ts-ignore
  (window as any).process = { env: {} };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
