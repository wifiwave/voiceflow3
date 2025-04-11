/**
 * Play.ai Speech-to-Text API Integration
 * 
 * This module handles speech-to-text functionality using the Play.ai API.
 * It provides functions for converting audio to text with various options
 * and customization parameters.
 */

import playAiAuth from './playAiAuth';

/**
 * Convert audio file to text using Play.ai API
 * @param {Object} options - Speech-to-text options
 * @param {File|Blob} options.audioFile - The audio file to transcribe
 * @param {string} options.language - Language code (default: 'en-US')
 * @param {boolean} options.punctuate - Whether to add punctuation (default: true)
 * @param {boolean} options.filterProfanity - Whether to filter profanity (default: false)
 * @returns {Promise<Object>} Promise resolving to transcription result
 * @throws {Error} If the request fails
 */
export const audioToText = async ({
  audioFile,
  language = 'en-US',
  punctuate = true,
  filterProfanity = false
}) => {
  if (!audioFile) {
    throw new Error('Audio file is required');
  }

  try {
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('language', language);
    formData.append('punctuate', punctuate.toString());
    formData.append('filter_profanity', filterProfanity.toString());

    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/stt/transcribe`, {
      method: 'POST',
      headers: {
        'X-User-ID': playAiAuth.PLAY_AI_USER_ID,
        'X-API-Key': playAiAuth.PLAY_AI_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to convert audio to text');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in speech-to-text conversion:', error);
    throw error;
  }
};

/**
 * Get supported languages for speech-to-text
 * @returns {Promise<Array>} Promise resolving to array of supported languages
 * @throws {Error} If the request fails
 */
export const getSupportedLanguages = async () => {
  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/stt/languages`, {
      method: 'GET',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get supported languages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting supported languages:', error);
    throw error;
  }
};

/**
 * Stream audio for real-time transcription
 * @param {Object} options - Streaming options
 * @param {MediaStream} options.mediaStream - Media stream from microphone
 * @param {string} options.language - Language code (default: 'en-US')
 * @param {boolean} options.interimResults - Whether to return interim results (default: true)
 * @param {Function} options.onTranscript - Callback for transcript updates
 * @param {Function} options.onError - Callback for errors
 * @returns {Object} Controller object with start, stop, and pause methods
 */
export const streamSpeechToText = ({
  mediaStream,
  language = 'en-US',
  interimResults = true,
  onTranscript,
  onError
}) => {
  if (!mediaStream) {
    const error = new Error('Media stream is required');
    if (onError) onError(error);
    throw error;
  }

  let isStreaming = false;
  let socket = null;
  let mediaRecorder = null;
  
  // Create WebSocket URL with authentication
  const createWebSocketUrl = () => {
    const wsUrl = new URL(`${playAiAuth.PLAY_AI_BASE_URL.replace('https://', 'wss://')}/stt/stream`);
    wsUrl.searchParams.append('user_id', playAiAuth.PLAY_AI_USER_ID);
    wsUrl.searchParams.append('api_key', playAiAuth.PLAY_AI_API_KEY);
    wsUrl.searchParams.append('language', language);
    wsUrl.searchParams.append('interim_results', interimResults.toString());
    return wsUrl.toString();
  };

  // Start streaming
  const start = () => {
    try {
      // Create WebSocket connection
      socket = new WebSocket(createWebSocketUrl());
      
      // Set up WebSocket event handlers
      socket.onopen = () => {
        console.log('WebSocket connection established for speech-to-text');
        
        // Create media recorder
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'audio/webm'
        });
        
        // Set up media recorder event handlers
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
          }
        };
        
        // Start recording
        mediaRecorder.start(100); // Collect data every 100ms
        isStreaming = true;
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (onTranscript) {
            onTranscript({
              text: data.text,
              isFinal: data.is_final,
              confidence: data.confidence
            });
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          if (onError) onError(err);
        }
      };
      
      socket.onerror = (event) => {
        console.error('WebSocket error:', event);
        if (onError) onError(new Error('WebSocket connection error'));
      };
      
      socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        isStreaming = false;
        
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      };
      
      return true;
    } catch (error) {
      console.error('Error starting speech-to-text stream:', error);
      if (onError) onError(error);
      return false;
    }
  };

  // Stop streaming
  const stop = () => {
    isStreaming = false;
    
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    
    if (socket) {
      socket.close(1000, 'User initiated stop');
    }
    
    return true;
  };

  // Pause streaming
  const pause = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      return true;
    }
    return false;
  };

  // Resume streaming
  const resume = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      return true;
    }
    return false;
  };

  // Return controller object
  return {
    start,
    stop,
    pause,
    resume,
    isStreaming: () => isStreaming
  };
};

/**
 * Transcribe audio from a URL
 * @param {Object} options - Transcription options
 * @param {string} options.audioUrl - URL of the audio file to transcribe
 * @param {string} options.language - Language code (default: 'en-US')
 * @param {boolean} options.punctuate - Whether to add punctuation (default: true)
 * @returns {Promise<Object>} Promise resolving to transcription result
 * @throws {Error} If the request fails
 */
export const transcribeAudioUrl = async ({
  audioUrl,
  language = 'en-US',
  punctuate = true
}) => {
  if (!audioUrl) {
    throw new Error('Audio URL is required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/stt/transcribe-url`, {
      method: 'POST',
      headers: playAiAuth.getAuthHeaders(),
      body: JSON.stringify({
        audio_url: audioUrl,
        language,
        punctuate
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to transcribe audio URL');
    }

    return await response.json();
  } catch (error) {
    console.error('Error transcribing audio URL:', error);
    throw error;
  }
};

export default {
  audioToText,
  getSupportedLanguages,
  streamSpeechToText,
  transcribeAudioUrl
};
