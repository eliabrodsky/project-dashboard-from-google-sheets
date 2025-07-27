
// A simple, singleton logger to provide context to console messages.
// This is a simplified version to avoid potential conflicts with dependencies.

const logger = {
  success: (message: string, data?: any, context = 'Default') => {
    console.log(`%c[${context}] ${message}`, 'color: #22c55e', data !== undefined ? data : '');
  },
  info: (message: string, data?: any, context = 'Default') => {
    console.info(`%c[${context}] ${message}`, 'color: #3b82f6', data !== undefined ? data : '');
  },
  warn: (message: string, data?: any, context = 'Default') => {
    console.warn(`%c[${context}] ${message}`, 'color: #f59e0b', data !== undefined ? data : '');
  },
  error: (message: string, data?: any, context = 'Default') => {
    console.error(`%c[${context}] ${message}`, 'color: #ef4444', data !== undefined ? data : '');
  },
  debug: (message: string, data?: any, context = 'Default') => {
    console.debug(`%c[${context}] ${message}`, 'color: #6b7280', data !== undefined ? data : '');
  },
};

// Re-export the type for other files
type LoggerType = typeof logger;
export type { LoggerType };

export default logger;
