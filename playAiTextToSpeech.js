/**
 * Play.ai Text-to-Speech API Integration
 * 
 * This module handles text-to-speech functionality using the Play.ai API.
 * It provides functions for converting text to speech with various voice options
 * and customization parameters.
 */

import playAiAuth from './playAiAuth';

/**
 * Convert text to speech using Play.ai API
 * @param {Object} options - Text-to-speech options
 * @param {string} options.text - The text to convert to speech
 * @param {string} options.voiceId - The voice ID to use (default: 'en-US-Neural2-F')
 * @param {number} options.speed - Speech speed factor (0.5 to 2.0, default: 1.0)
 * @param {number} options.pitch - Speech pitch factor (0.5 to 2.0, default: 1.0)
 * @param {string} options.format - Audio format ('mp3' or 'wav', default: 'mp3')
 * @returns {Promise<Object>} Promise resolving to response with audio URL
 * @throws {Error} If the request fails
 */
export const textToSpeech = async ({
  text,
  voiceId = 'en-US-Neural2-F',
  speed = 1.0,
  pitch = 1.0,
  format = 'mp3'
}) => {
  if (!text || typeof text !== 'string') {
    throw new Error('Text is required and must be a string');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/tts/synthesize`, {
      method: 'POST',
      headers: playAiAuth.getAuthHeaders(),
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        speed_factor: speed,
        pitch_factor: pitch,
        output_format: format
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to convert text to speech');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
};

/**
 * Get available voices from Play.ai API
 * @returns {Promise<Array>} Promise resolving to array of available voices
 * @throws {Error} If the request fails
 */
export const getAvailableVoices = async () => {
  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/tts/voices`, {
      method: 'GET',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get available voices');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting available voices:', error);
    throw error;
  }
};

/**
 * Stream text-to-speech audio for real-time playback
 * @param {Object} options - Text-to-speech options
 * @param {string} options.text - The text to convert to speech
 * @param {string} options.voiceId - The voice ID to use
 * @param {number} options.speed - Speech speed factor
 * @param {number} options.pitch - Speech pitch factor
 * @param {Function} options.onAudioChunk - Callback for each audio chunk
 * @param {Function} options.onComplete - Callback when streaming is complete
 * @param {Function} options.onError - Callback for errors
 * @returns {Promise<void>} Promise that resolves when streaming is complete
 */
export const streamTextToSpeech = async ({
  text,
  voiceId = 'en-US-Neural2-F',
  speed = 1.0,
  pitch = 1.0,
  onAudioChunk,
  onComplete,
  onError
}) => {
  if (!text || typeof text !== 'string') {
    const error = new Error('Text is required and must be a string');
    if (onError) onError(error);
    throw error;
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/tts/stream`, {
      method: 'POST',
      headers: {
        ...playAiAuth.getAuthHeaders(),
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        speed_factor: speed,
        pitch_factor: pitch
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      const error = new Error(errorText || 'Failed to stream text to speech');
      if (onError) onError(error);
      throw error;
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      // Process audio chunk
      if (value && value.length > 0) {
        // Decode audio data
        const audioBuffer = await audioContext.decodeAudioData(value.buffer);
        
        // Call callback with audio chunk
        if (onAudioChunk) onAudioChunk(audioBuffer);
      }
    }
    
    // Streaming complete
    if (onComplete) onComplete();
    
  } catch (error) {
    console.error('Error streaming text to speech:', error);
    if (onError) onError(error);
    throw error;
  }
};

/**
 * Create a custom voice clone using Play.ai API
 * @param {Object} options - Voice cloning options
 * @param {string} options.name - Name for the custom voice
 * @param {File} options.audioFile - Audio file for voice cloning (min 30 seconds)
 * @param {string} options.description - Optional description of the voice
 * @returns {Promise<Object>} Promise resolving to voice clone information
 * @throws {Error} If the request fails
 */
export const createVoiceClone = async ({ name, audioFile, description = '' }) => {
  if (!name || !audioFile) {
    throw new Error('Name and audio file are required for voice cloning');
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('audio_file', audioFile);
    formData.append('description', description);

    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/tts/voice-clone`, {
      method: 'POST',
      headers: {
        'X-User-ID': playAiAuth.PLAY_AI_USER_ID,
        'X-API-Key': playAiAuth.PLAY_AI_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create voice clone');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating voice clone:', error);
    throw error;
  }
};

export default {
  textToSpeech,
  getAvailableVoices,
  streamTextToSpeech,
  createVoiceClone
};
