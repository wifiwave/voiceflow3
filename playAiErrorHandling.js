/**
 * Play.ai API Error Handling and Recovery System
 * 
 * This module provides error handling utilities and recovery mechanisms
 * for Play.ai API integrations. It includes error classification, retry logic,
 * fallback strategies, and error reporting.
 */

// Error types
export const ErrorTypes = {
  AUTHENTICATION: 'authentication',
  NETWORK: 'network',
  SERVER: 'server',
  RATE_LIMIT: 'rate_limit',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  RESOURCE_NOT_FOUND: 'resource_not_found',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

/**
 * Classify an error based on its properties and message
 * @param {Error} error - The error to classify
 * @returns {string} Error type from ErrorTypes
 */
export const classifyError = (error) => {
  if (!error) return ErrorTypes.UNKNOWN;
  
  const message = error.message || '';
  const status = error.status || error.statusCode || 0;
  
  // Network errors
  if (message.includes('network') || 
      message.includes('connection') || 
      !navigator.onLine) {
    return ErrorTypes.NETWORK;
  }
  
  // Authentication errors
  if (status === 401 || 
      message.includes('unauthorized') || 
      message.includes('authentication') || 
      message.includes('invalid credentials') ||
      message.includes('api key')) {
    return ErrorTypes.AUTHENTICATION;
  }
  
  // Rate limit errors
  if (status === 429 || 
      message.includes('rate limit') || 
      message.includes('too many requests')) {
    return ErrorTypes.RATE_LIMIT;
  }
  
  // Server errors
  if (status >= 500 || 
      message.includes('server error') || 
      message.includes('internal error')) {
    return ErrorTypes.SERVER;
  }
  
  // Validation errors
  if (status === 400 || 
      message.includes('validation') || 
      message.includes('invalid')) {
    return ErrorTypes.VALIDATION;
  }
  
  // Permission errors
  if (status === 403 || 
      message.includes('permission') || 
      message.includes('forbidden')) {
    return ErrorTypes.PERMISSION;
  }
  
  // Resource not found errors
  if (status === 404 || 
      message.includes('not found')) {
    return ErrorTypes.RESOURCE_NOT_FOUND;
  }
  
  // Timeout errors
  if (message.includes('timeout') || 
      message.includes('timed out')) {
    return ErrorTypes.TIMEOUT;
  }
  
  // Default to unknown
  return ErrorTypes.UNKNOWN;
};

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if retry should be attempted
 * @returns {Promise<any>} Result of the function
 */
export const retryWithBackoff = async (fn, {
  maxRetries = 3,
  baseDelay = 1000,
  maxDelay = 10000,
  shouldRetry = (error) => {
    const errorType = classifyError(error);
    return [ErrorTypes.NETWORK, ErrorTypes.SERVER, ErrorTypes.TIMEOUT, ErrorTypes.RATE_LIMIT].includes(errorType);
  }
} = {}) => {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        maxDelay,
        baseDelay * Math.pow(2, retries) * (0.8 + Math.random() * 0.4)
      );
      
      console.log(`Retry ${retries + 1}/${maxRetries} after ${Math.round(delay)}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      retries++;
    }
  }
};

/**
 * Create a fallback chain for API calls
 * @param {Array<Function>} fns - Array of functions to try in order
 * @returns {Promise<any>} Result of the first successful function
 */
export const fallbackChain = async (fns) => {
  if (!fns || !fns.length) {
    throw new Error('No fallback functions provided');
  }
  
  let lastError = null;
  
  for (const fn of fns) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn('Fallback function failed, trying next option:', error);
    }
  }
  
  throw lastError || new Error('All fallback options failed');
};

/**
 * Error handler for Play.ai API calls
 * @param {Error} error - The error to handle
 * @param {Object} options - Handler options
 * @param {Function} options.onAuthError - Callback for authentication errors
 * @param {Function} options.onNetworkError - Callback for network errors
 * @param {Function} options.onRateLimitError - Callback for rate limit errors
 * @param {Function} options.onServerError - Callback for server errors
 * @param {Function} options.onValidationError - Callback for validation errors
 * @param {Function} options.onPermissionError - Callback for permission errors
 * @param {Function} options.onNotFoundError - Callback for resource not found errors
 * @param {Function} options.onTimeoutError - Callback for timeout errors
 * @param {Function} options.onUnknownError - Callback for unknown errors
 * @returns {void}
 */
export const handleApiError = (error, {
  onAuthError,
  onNetworkError,
  onRateLimitError,
  onServerError,
  onValidationError,
  onPermissionError,
  onNotFoundError,
  onTimeoutError,
  onUnknownError
} = {}) => {
  const errorType = classifyError(error);
  
  console.error(`Play.ai API Error (${errorType}):`, error);
  
  // Call appropriate handler based on error type
  switch (errorType) {
    case ErrorTypes.AUTHENTICATION:
      if (onAuthError) onAuthError(error);
      break;
    case ErrorTypes.NETWORK:
      if (onNetworkError) onNetworkError(error);
      break;
    case ErrorTypes.RATE_LIMIT:
      if (onRateLimitError) onRateLimitError(error);
      break;
    case ErrorTypes.SERVER:
      if (onServerError) onServerError(error);
      break;
    case ErrorTypes.VALIDATION:
      if (onValidationError) onValidationError(error);
      break;
    case ErrorTypes.PERMISSION:
      if (onPermissionError) onPermissionError(error);
      break;
    case ErrorTypes.RESOURCE_NOT_FOUND:
      if (onNotFoundError) onNotFoundError(error);
      break;
    case ErrorTypes.TIMEOUT:
      if (onTimeoutError) onTimeoutError(error);
      break;
    case ErrorTypes.UNKNOWN:
    default:
      if (onUnknownError) onUnknownError(error);
      break;
  }
};

/**
 * Create a wrapped API function with error handling and recovery
 * @param {Function} apiFn - API function to wrap
 * @param {Object} options - Options for error handling and recovery
 * @param {boolean} options.useRetry - Whether to use retry logic (default: true)
 * @param {Object} options.retryOptions - Options for retry logic
 * @param {Array<Function>} options.fallbacks - Fallback functions to try if main function fails
 * @param {Object} options.errorHandlers - Error handler callbacks
 * @returns {Function} Wrapped function with error handling and recovery
 */
export const createResilientApiCall = (apiFn, {
  useRetry = true,
  retryOptions = {},
  fallbacks = [],
  errorHandlers = {}
} = {}) => {
  return async (...args) => {
    try {
      // Create main function
      const mainFn = async () => {
        if (useRetry) {
          return await retryWithBackoff(() => apiFn(...args), retryOptions);
        } else {
          return await apiFn(...args);
        }
      };
      
      // If fallbacks are provided, use fallback chain
      if (fallbacks && fallbacks.length > 0) {
        return await fallbackChain([mainFn, ...fallbacks]);
      } else {
        return await mainFn();
      }
    } catch (error) {
      // Handle error
      handleApiError(error, errorHandlers);
      throw error;
    }
  };
};

/**
 * Monitor WebSocket connection and automatically reconnect if needed
 * @param {Object} options - WebSocket monitoring options
 * @param {WebSocket} options.socket - WebSocket instance to monitor
 * @param {Function} options.createSocket - Function to create a new socket
 * @param {number} options.maxReconnects - Maximum reconnection attempts (default: 5)
 * @param {number} options.reconnectDelay - Base delay between reconnects in ms (default: 1000)
 * @param {Function} options.onReconnect - Callback when reconnection is attempted
 * @param {Function} options.onMaxReconnects - Callback when max reconnects is reached
 * @returns {Object} Controller with start and stop methods
 */
export const monitorWebSocketConnection = ({
  socket,
  createSocket,
  maxReconnects = 5,
  reconnectDelay = 1000,
  onReconnect,
  onMaxReconnects
}) => {
  if (!socket || !createSocket) {
    throw new Error('Socket and createSocket function are required');
  }
  
  let currentSocket = socket;
  let reconnectAttempts = 0;
  let reconnectTimeout = null;
  let isMonitoring = false;
  
  // Handle socket close event
  const handleClose = (event) => {
    if (!isMonitoring) return;
    
    // Only reconnect if close was not clean
    if (!event.wasClean && reconnectAttempts < maxReconnects) {
      reconnectAttempts++;
      
      const delay = reconnectDelay * Math.pow(1.5, reconnectAttempts - 1);
      console.log(`WebSocket closed. Reconnecting in ${Math.round(delay)}ms (${reconnectAttempts}/${maxReconnects})`);
      
      if (onReconnect) {
        onReconnect(reconnectAttempts, delay);
      }
      
      reconnectTimeout = setTimeout(() => {
        try {
          // Create new socket
          currentSocket = createSocket();
          
          // Set up event handlers
          currentSocket.addEventListener('close', handleClose);
        } catch (error) {
          console.error('Error reconnecting WebSocket:', error);
        }
      }, delay);
    } else if (reconnectAttempts >= maxReconnects) {
      console.error('Maximum WebSocket reconnection attempts reached');
      
      if (onMaxReconnects) {
        onMaxReconnects();
      }
    }
  };
  
  // Start monitoring
  const start = () => {
    if (isMonitoring) return;
    
    isMonitoring = true;
    reconnectAttempts = 0;
    
    // Set up event handler
    currentSocket.addEventListener('close', handleClose);
    
    return true;
  };
  
  // Stop monitoring
  const stop = () => {
    if (!isMonitoring) return;
    
    isMonitoring = false;
    
    // Clear timeout if exists
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    // Remove event handler
    currentSocket.removeEventListener('close', handleClose);
    
    return true;
  };
  
  // Return controller
  return {
    start,
    stop,
    getReconnectAttempts: () => reconnectAttempts,
    isMonitoring: () => isMonitoring
  };
};

/**
 * Create a circuit breaker for API calls
 * @param {Object} options - Circuit breaker options
 * @param {number} options.failureThreshold - Number of failures before opening circuit (default: 5)
 * @param {number} options.resetTimeout - Time in ms before trying to close circuit (default: 30000)
 * @param {Function} options.onOpen - Callback when circuit opens
 * @param {Function} options.onClose - Callback when circuit closes
 * @param {Function} options.onHalfOpen - Callback when circuit goes to half-open state
 * @returns {Object} Circuit breaker instance
 */
export const createCircuitBreaker = ({
  failureThreshold = 5,
  resetTimeout = 30000,
  onOpen,
  onClose,
  onHalfOpen
} = {}) => {
  const states = {
    CLOSED: 'closed',
    OPEN: 'open',
    HALF_OPEN: 'half-open'
  };
  
  let state = states.CLOSED;
  let failures = 0;
  let resetTimer = null;
  let lastError = null;
  
  // Execute function with circuit breaker protection
  const execute = async (fn) => {
    if (state === states.OPEN) {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await fn();
      
      // Success - reset circuit
      if (state === states.HALF_OPEN) {
        state = states.CLOSED;
        failures = 0;
        if (onClose) onClose();
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Handle failure
      if (state === states.HALF_OPEN) {
        // Failed in half-open state, reopen circuit
        state = states.OPEN;
        scheduleReset();
        if (onOpen) onOpen(error);
      } else if (state === states.CLOSED) {
        failures++;
        
        if (failures >= failureThreshold) {
          // Too many failures, open circuit
          state = states.OPEN;
          scheduleReset();
          if (onOpen) onOpen(error);
        }
      }
      
      throw error;
    }
  };
  
  // Schedule circuit reset
  const scheduleReset = () => {
    if (resetTimer) {
      clearTimeout(resetTimer);
    }
    
    resetTimer = setTimeout(() => {
      if (state === states.OPEN) {
        state = states.HALF_OPEN;
        if (onHalfOpen) onHalfOpen();
      }
    }, resetTimeout);
  };
  
  // Reset circuit breaker
  const reset = () => {
    state = states.CLOSED;
    failures = 0;
    
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
    
    if (onClose) onClose();
  };
  
  // Return circuit breaker instance
  return {
    execute,
    reset,
    getState: () => state,
    getFailureCount: () => failures,
    getLastError: () => lastError
  };
};

export default {
  ErrorTypes,
  classifyError,
  retryWithBackoff,
  fallbackChain,
  handleApiError,
  createResilientApiCall,
  monitorWebSocketConnection,
  createCircuitBreaker
};
