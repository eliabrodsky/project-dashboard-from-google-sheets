
// /updated file 2024-07-24T12:00:00Z
// index.tsx
import logger from './services/logger';
logger.info("--- STARTING BOOTSTRAP ---");
logger.info("01: Logger imported.");

logger.info("02: Importing React...");
import React from 'react';
logger.info("03: React imported successfully.");

logger.info("04: Importing ReactDOM...");
import ReactDOM from 'react-dom/client';
logger.info("05: ReactDOM imported successfully.");

// --- DEBUGGING STEP 2: ENABLE APP COMPONENTS ---
logger.info("06: Importing App component...");
import App from './App';
logger.info("07: App component imported successfully.");

logger.info("08: Importing ErrorBoundary component...");
import ErrorBoundary from './components/ErrorBoundary';
logger.info("09: ErrorBoundary component imported successfully.");


try {
  logger.info("10: Getting root element from DOM...");
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    logger.error("CRITICAL: Could not find root element to mount to.", {});
    throw new Error("Could not find root element to mount to");
  }
  logger.info("11: Root element found.");

  logger.info("12: Creating React root...");
  const root = ReactDOM.createRoot(rootElement);
  logger.info("13: React root created.");

  // --- DEBUGGING STEP 2: RENDER FULL APPLICATION ---
  logger.info("14: Rendering application...");
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  logger.success("15: React application rendered successfully.");

} catch (mountError) {
  logger.error("CRITICAL: Failed to mount application", { error: mountError });
  
  // Fallback error display if React fails to render
  const rootElement = document.getElementById('root');
  if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h1>Application failed to start</h1>
          <p>A critical error occurred during initialization.</p>
          <p>Please check the browser console for a step-by-step log to identify the point of failure.</p>
          <pre style="background: #eee; padding: 10px; border-radius: 4px; white-space: pre-wrap;">${mountError instanceof Error ? mountError.stack : String(mountError)}</pre>
        </div>
      `;
  }
}
