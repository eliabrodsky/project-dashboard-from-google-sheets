import Logger from '../services/logger';

const globalLogger = new Logger('GlobalErrorHandler');

/**
 * Sets up global error handlers to catch uncaught exceptions and unhandled promise rejections.
 */
export function setupGlobalErrorHandlers() {
  window.onerror = (message, source, lineno, colno, error) => {
    globalLogger.error('Unhandled global error caught by window.onerror', {
      message,
      source,
      lineno,
      colno,
      error,
    });
    // When returning true, this prevents the firing of the default event handler.
    return true;
  };

  window.addEventListener('unhandledrejection', event => {
    globalLogger.error('Unhandled promise rejection caught', {
      reason: event.reason,
    });
    event.preventDefault();
  });
}

/**
 * Safely converts any value to a string, providing a fallback for null/undefined.
 */
export const safeString = (value: any, fallback = ''): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
};

/**
 * Safely converts any value to a number, providing a fallback for non-numeric values.
 */
export const safeNumber = (value: any, fallback = 0): number => {
  if (value === null || value === undefined) {
    return fallback;
  }
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

/**
 * Safely extracts a readable message from an unknown error type.
 * This is crucial for preventing "Cannot convert object to primitive value" errors.
 */
export const handlePrimitiveConversionError = (error: unknown, prefix = 'Error'): string => {
  if (error instanceof Error) {
    return `${prefix}: ${error.message}`;
  }
  if (typeof error === 'object' && error !== null) {
    const message = (error as any).message || (error as any).error_description || 'An unknown object was thrown.';
    return `${prefix}: ${safeString(message)}`;
  }
  return `${prefix}: ${safeString(error, 'An unknown error occurred.')}`;
};


/**
 * Logs the properties of an object for debugging purposes.
 */
export const debugObjectProperties = (obj: any, name = 'Object') => {
    const debugLogger = new Logger('Debug');
    if (typeof obj !== 'object' || obj === null) {
        debugLogger.debug(`${name} is not an object`, obj);
        return;
    }
    debugLogger.debug(`Debugging properties for: ${name}`, {
        ...obj,
        propertyKeys: Object.keys(obj)
    });
};

/**
 * A wrapper for async functions to ensure consistent logging and error handling.
 */
export const safeApiCall = async <T>(
    apiCall: () => Promise<T>,
    context: string = 'API Call'
): Promise<T> => {
    const apiLogger = new Logger(context);
    try {
        return await apiCall();
    } catch (error) {
        apiLogger.error('API call failed', error);
        // Re-throw the error so the calling function's catch block can handle it
        throw error;
    }
};
