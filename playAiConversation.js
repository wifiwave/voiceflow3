/**
 * Play.ai WebSocket API for Real-Time Conversations
 * 
 * This module handles real-time conversations using the Play.ai WebSocket API.
 * It provides functions for establishing WebSocket connections, sending and receiving
 * messages, and managing conversation state.
 */

import playAiAuth from './playAiAuth';

/**
 * Create a WebSocket connection for real-time conversation with a voice agent
 * @param {Object} options - Connection options
 * @param {string} options.agentId - ID of the voice agent to connect to
 * @param {Function} options.onMessage - Callback for received messages
 * @param {Function} options.onTranscript - Callback for speech-to-text transcripts
 * @param {Function} options.onAudioResponse - Callback for audio responses
 * @param {Function} options.onError - Callback for errors
 * @param {Function} options.onStatusChange - Callback for connection status changes
 * @returns {Object} Conversation controller with methods for interaction
 */
export const createConversation = ({
  agentId,
  onMessage,
  onTranscript,
  onAudioResponse,
  onError,
  onStatusChange
}) => {
  if (!agentId) {
    const error = new Error('Agent ID is required');
    if (onError) onError(error);
    throw error;
  }

  let socket = null;
  let status = 'disconnected';
  let mediaRecorder = null;
  let audioContext = null;
  let conversationId = null;
  
  // Update status and trigger callback
  const updateStatus = (newStatus) => {
    status = newStatus;
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // Create WebSocket URL with authentication
  const createWebSocketUrl = () => {
    const wsUrl = new URL(`${playAiAuth.PLAY_AI_BASE_URL.replace('https://', 'wss://')}/conversation`);
    wsUrl.searchParams.append('user_id', playAiAuth.PLAY_AI_USER_ID);
    wsUrl.searchParams.append('api_key', playAiAuth.PLAY_AI_API_KEY);
    wsUrl.searchParams.append('agent_id', agentId);
    return wsUrl.toString();
  };

  // Connect to WebSocket
  const connect = () => {
    try {
      updateStatus('connecting');
      
      // Create WebSocket connection
      socket = new WebSocket(createWebSocketUrl());
      
      // Set up WebSocket event handlers
      socket.onopen = () => {
        console.log('WebSocket connection established for conversation');
        updateStatus('connected');
        
        // Initialize audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          // Handle different message types
          if (data.type === 'conversation_started') {
            conversationId = data.conversation_id;
            if (onMessage) onMessage(data);
          } else if (data.type === 'transcript') {
            if (onTranscript) onTranscript(data);
          } else if (data.type === 'agent_response') {
            if (onMessage) onMessage(data);
            
            // Handle audio response if available
            if (data.audio_url && onAudioResponse) {
              onAudioResponse(data.audio_url);
            }
          } else if (data.type === 'error') {
            console.error('Error from Play.ai API:', data.message);
            if (onError) onError(new Error(data.message));
          } else {
            // Handle other message types
            if (onMessage) onMessage(data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          if (onError) onError(err);
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        updateStatus('error');
        if (onError) onError(new Error('WebSocket connection error'));
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        updateStatus('disconnected');
        
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error connecting to conversation WebSocket:', error);
      updateStatus('error');
      if (onError) onError(error);
      return false;
    }
  };

  // Disconnect WebSocket
  const disconnect = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    if (socket) {
      socket.close(1000, 'User initiated disconnect');
      socket = null;
    }
    
    updateStatus('disconnected');
    return true;
  };

  // Send text message to agent
  const sendTextMessage = (text) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      const error = new Error('WebSocket is not connected');
      if (onError) onError(error);
      return false;
    }
    
    try {
      const message = {
        type: 'user_message',
        text,
        conversation_id: conversationId
      };
      
      socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending text message:', error);
      if (onError) onError(error);
      return false;
    }
  };

  // Start recording audio
  const startRecording = async () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      const error = new Error('WebSocket is not connected');
      if (onError) onError(error);
      return false;
    }
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket && socket.readyState === WebSocket.OPEN) {
          // Send audio chunk with metadata
          const message = {
            type: 'audio_chunk',
            conversation_id: conversationId
          };
          
          // Send metadata first
          socket.send(JSON.stringify(message));
          
          // Then send the audio data
          socket.send(event.data);
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      return true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      if (onError) onError(error);
      return false;
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return true;
    }
    return false;
  };

  // Get current status
  const getStatus = () => status;

  // Get conversation ID
  const getConversationId = () => conversationId;

  // Return controller object
  return {
    connect,
    disconnect,
    sendTextMessage,
    startRecording,
    stopRecording,
    getStatus,
    getConversationId
  };
};

/**
 * Get conversation history
 * @param {string} conversationId - ID of the conversation
 * @returns {Promise<Object>} Promise resolving to conversation history
 * @throws {Error} If the request fails
 */
export const getConversationHistory = async (conversationId) => {
  if (!conversationId) {
    throw new Error('Conversation ID is required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/conversations/${conversationId}`, {
      method: 'GET',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get conversation history');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw error;
  }
};

/**
 * Get all conversations for a specific agent
 * @param {string} agentId - ID of the voice agent
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of conversations to return
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} Promise resolving to array of conversations
 * @throws {Error} If the request fails
 */
export const getAgentConversations = async (agentId, { limit = 50, offset = 0 } = {}) => {
  if (!agentId) {
    throw new Error('Agent ID is required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents/${agentId}/conversations?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get agent conversations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting agent conversations:', error);
    throw error;
  }
};

/**
 * Rate a conversation for quality feedback
 * @param {string} conversationId - ID of the conversation
 * @param {number} rating - Rating value (1-5)
 * @param {string} feedback - Optional feedback text
 * @returns {Promise<Object>} Promise resolving to rating result
 * @throws {Error} If the request fails
 */
export const rateConversation = async (conversationId, rating, feedback = '') => {
  if (!conversationId || !rating) {
    throw new Error('Conversation ID and rating are required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/conversations/${conversationId}/rate`, {
      method: 'POST',
      headers: playAiAuth.getAuthHeaders(),
      body: JSON.stringify({
        rating,
        feedback
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to rate conversation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error rating conversation:', error);
    throw error;
  }
};

export default {
  createConversation,
  getConversationHistory,
  getAgentConversations,
  rateConversation
};
