
import logger from '../services/logger';
// AdvancedLogger is not used in this debugging version
// import { AdvancedLogger } from './advancedLogger';

const CONTEXT = 'ErrorHandler';

/**
 * Safely converts any value to a string, providing a fallback for null/undefined.
 * This version is enhanced to prevent "Cannot convert object to primitive value" errors
 * by using JSON.stringify as a fallback for objects that fail standard conversion.
 */
export const safeString = (value: any, fallback = ''): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  try {
    // Attempt the standard string conversion first.
    return String(value);
  } catch (e) {
    // If the standard conversion fails with a TypeError, it's likely an
    // object that cannot be coerced to a primitive (e.g., Object.create(null)).
    if (e instanceof TypeError) {
      try {
        // Attempt to serialize it to a JSON string.
        return JSON.stringify(value);
      } catch (jsonError) {
        // If JSON.stringify also fails (e.g., circular reference), return a placeholder.
        return '[Unstringifiable Object]';
      }
    }
    // Re-throw any other unexpected errors.
    throw e;
  }
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
    if (typeof obj !== 'object' || obj === null) {
        logger.debug(`${name} is not an object`, obj, CONTEXT);
        return;
    }
    logger.debug(`Debugging properties for: ${name}`, {
        ...obj,
        propertyKeys: Object.keys(obj)
    }, CONTEXT);
};

/**
 * A wrapper for async functions to ensure consistent logging and error handling.
 */
export const safeApiCall = async <T>(
    apiCall: () => Promise<T>,
    context: string = 'API Call'
): Promise<T> => {
    try {
        return await apiCall();
    } catch (error) {
        logger.error(`Error in ${context}`, error, CONTEXT);
        // In this debug version, we are not using AdvancedLogger
        // AdvancedLogger.logError(error, { component: 'safeApiCall', action: context, additionalData: { originalError: error }});
        // Re-throw the error so the calling function's catch block can handle it
        throw error;
    }
};
