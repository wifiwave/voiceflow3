import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing WebSocket connections with Play.ai API
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.userId - Play.ai User ID
 * @param {string} options.apiKey - Play.ai API Key
 * @param {string} options.agentId - ID of the voice agent to connect to
 * @param {Function} options.onMessage - Callback for received messages
 * @param {Function} options.onError - Callback for errors
 * @param {Function} options.onStatusChange - Callback for connection status changes
 * @returns {Object} WebSocket controls and state
 */
const usePlayAiWebSocket = ({
  userId,
  apiKey,
  agentId,
  onMessage,
  onError,
  onStatusChange
}) => {
  const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected, error
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000; // 2 seconds

  // Update status and trigger callback
  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // Handle errors
  const handleError = (err) => {
    setError(err);
    updateStatus('error');
    if (onError) {
      onError(err);
    }
  };

  // Connect to WebSocket
  const connect = () => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    try {
      updateStatus('connecting');
      
      // Create WebSocket connection to Play.ai API
      const wsUrl = `wss://api.play.ai/v1/conversation?user_id=${userId}&api_key=${apiKey}&agent_id=${agentId}`;
      socketRef.current = new WebSocket(wsUrl);
      
      // Set up event handlers
      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        updateStatus('connected');
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
      };
      
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          handleError(new Error('Failed to parse message from server'));
        }
      };
      
      socketRef.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        handleError(new Error('WebSocket connection error'));
      };
      
      socketRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        updateStatus('disconnected');
        
        // Attempt to reconnect if not closed cleanly and within max attempts
        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          handleError(new Error('Maximum reconnection attempts reached'));
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      handleError(err);
    }
  };

  // Disconnect WebSocket
  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close(1000, 'User initiated disconnect');
      socketRef.current = null;
      updateStatus('disconnected');
    }
  };

  // Send message through WebSocket
  const sendMessage = (message) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      handleError(new Error('WebSocket is not connected'));
      return false;
    }
    
    try {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      socketRef.current.send(messageString);
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      handleError(err);
      return false;
    }
  };

  // Send audio data through WebSocket
  const sendAudioChunk = (audioChunk) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      handleError(new Error('WebSocket is not connected'));
      return false;
    }
    
    try {
      socketRef.current.send(audioChunk);
      return true;
    } catch (err) {
      console.error('Error sending audio chunk:', err);
      handleError(err);
      return false;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    status,
    error,
    connect,
    disconnect,
    sendMessage,
    sendAudioChunk,
    isConnected: status === 'connected'
  };
};

export default usePlayAiWebSocket;
