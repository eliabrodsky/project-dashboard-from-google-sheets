import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import Logger from './services/logger';
import { setupGlobalErrorHandlers } from './utils/errorHandlers';

const logger = new Logger('Index');

// Setup global error handlers as early as possible
setupGlobalErrorHandlers();

const rootElement = document.getElementById('root');
if (!rootElement) {
  const errorMessage = "Could not find root element to mount to";
  logger.error(errorMessage, new Error(errorMessage));
  throw new Error(errorMessage);
}

try {
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  logger.success('React application mounted successfully');
} catch (mountError) {
  logger.error('Failed to mount React application', mountError);
  
  // Fallback error display
  rootElement.innerHTML = `
    <div style="
      padding: 20px; 
      margin: 20px; 
      border: 2px solid #ef4444; 
      border-radius: 8px; 
      background-color: #fef2f2;
      font-family: Arial, sans-serif;
    ">
      <h2 style="color: #dc2626; margin-top: 0;">
        🚨 Application Failed to Start
      </h2>
      <p>The project dashboard could not be initialized.</p>
      <details style="margin-top: 16px;">
        <summary style="cursor: pointer; padding: 8px; background-color: #fee2e2; border: 1px solid #fca5a5; border-radius: 4px;">
          Click to see error details
        </summary>
        <pre style="
          margin-top: 8px; 
          padding: 12px; 
          background-color: #fff; 
          border: 1px solid #d1d5db; 
          border-radius: 4px; 
          font-size: 12px; 
          overflow: auto;
          white-space: pre-wrap;
        ">${mountError instanceof Error ? mountError.message : String(mountError)}</pre>
      </details>
      <div style="margin-top: 16px;">
        <button onclick="window.location.reload()" style="
          padding: 8px 16px; 
          background-color: #3b82f6; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer;
        ">
          Reload Page
        </button>
      </div>
    </div>
  `;
}