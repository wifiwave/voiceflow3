/**
 * Play.ai Voice Agent Management API Integration
 * 
 * This module handles voice agent creation, management, and configuration
 * using the Play.ai API. It provides functions for creating, updating, and
 * retrieving voice agents with various customization options.
 */

import playAiAuth from './playAiAuth';

/**
 * Create a new voice agent
 * @param {Object} options - Voice agent options
 * @param {string} options.name - Name of the voice agent
 * @param {string} options.description - Description of the voice agent
 * @param {string} options.voiceId - Voice ID to use for the agent
 * @param {Object} options.knowledgeBase - Knowledge base for the agent
 * @param {Object} options.personality - Personality traits for the agent
 * @param {Array} options.intents - Conversation intents for the agent
 * @returns {Promise<Object>} Promise resolving to created agent details
 * @throws {Error} If the request fails
 */
export const createVoiceAgent = async ({
  name,
  description = '',
  voiceId,
  knowledgeBase = {},
  personality = {},
  intents = []
}) => {
  if (!name || !voiceId) {
    throw new Error('Name and voiceId are required to create a voice agent');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents`, {
      method: 'POST',
      headers: playAiAuth.getAuthHeaders(),
      body: JSON.stringify({
        name,
        description,
        voice_id: voiceId,
        knowledge_base: knowledgeBase,
        personality,
        intents
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create voice agent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating voice agent:', error);
    throw error;
  }
};

/**
 * Get all voice agents
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of agents to return
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<Array>} Promise resolving to array of voice agents
 * @throws {Error} If the request fails
 */
export const getVoiceAgents = async ({ limit = 50, offset = 0 } = {}) => {
  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get voice agents');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting voice agents:', error);
    throw error;
  }
};

/**
 * Get a specific voice agent by ID
 * @param {string} agentId - ID of the voice agent to retrieve
 * @returns {Promise<Object>} Promise resolving to voice agent details
 * @throws {Error} If the request fails
 */
export const getVoiceAgent = async (agentId) => {
  if (!agentId) {
    throw new Error('Agent ID is required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents/${agentId}`, {
      method: 'GET',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get voice agent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting voice agent:', error);
    throw error;
  }
};

/**
 * Update an existing voice agent
 * @param {string} agentId - ID of the voice agent to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Promise resolving to updated agent details
 * @throws {Error} If the request fails
 */
export const updateVoiceAgent = async (agentId, updates) => {
  if (!agentId) {
    throw new Error('Agent ID is required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents/${agentId}`, {
      method: 'PATCH',
      headers: playAiAuth.getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update voice agent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating voice agent:', error);
    throw error;
  }
};

/**
 * Delete a voice agent
 * @param {string} agentId - ID of the voice agent to delete
 * @returns {Promise<boolean>} Promise resolving to true if deletion was successful
 * @throws {Error} If the request fails
 */
export const deleteVoiceAgent = async (agentId) => {
  if (!agentId) {
    throw new Error('Agent ID is required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents/${agentId}`, {
      method: 'DELETE',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete voice agent');
    }

    return true;
  } catch (error) {
    console.error('Error deleting voice agent:', error);
    throw error;
  }
};

/**
 * Add knowledge base content to a voice agent
 * @param {string} agentId - ID of the voice agent
 * @param {Object} content - Knowledge base content to add
 * @returns {Promise<Object>} Promise resolving to updated knowledge base
 * @throws {Error} If the request fails
 */
export const addKnowledgeBase = async (agentId, content) => {
  if (!agentId || !content) {
    throw new Error('Agent ID and content are required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents/${agentId}/knowledge`, {
      method: 'POST',
      headers: playAiAuth.getAuthHeaders(),
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add knowledge base content');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding knowledge base content:', error);
    throw error;
  }
};

/**
 * Upload a file to a voice agent's knowledge base
 * @param {string} agentId - ID of the voice agent
 * @param {File} file - File to upload
 * @returns {Promise<Object>} Promise resolving to upload result
 * @throws {Error} If the request fails
 */
export const uploadKnowledgeFile = async (agentId, file) => {
  if (!agentId || !file) {
    throw new Error('Agent ID and file are required');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents/${agentId}/knowledge/upload`, {
      method: 'POST',
      headers: {
        'X-User-ID': playAiAuth.PLAY_AI_USER_ID,
        'X-API-Key': playAiAuth.PLAY_AI_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload knowledge file');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading knowledge file:', error);
    throw error;
  }
};

/**
 * Train a voice agent with updated knowledge or configuration
 * @param {string} agentId - ID of the voice agent to train
 * @returns {Promise<Object>} Promise resolving to training status
 * @throws {Error} If the request fails
 */
export const trainVoiceAgent = async (agentId) => {
  if (!agentId) {
    throw new Error('Agent ID is required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents/${agentId}/train`, {
      method: 'POST',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to train voice agent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error training voice agent:', error);
    throw error;
  }
};

/**
 * Get training status for a voice agent
 * @param {string} agentId - ID of the voice agent
 * @returns {Promise<Object>} Promise resolving to training status
 * @throws {Error} If the request fails
 */
export const getTrainingStatus = async (agentId) => {
  if (!agentId) {
    throw new Error('Agent ID is required');
  }

  try {
    const response = await fetch(`${playAiAuth.PLAY_AI_BASE_URL}/agents/${agentId}/training-status`, {
      method: 'GET',
      headers: playAiAuth.getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get training status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting training status:', error);
    throw error;
  }
};

export default {
  createVoiceAgent,
  getVoiceAgents,
  getVoiceAgent,
  updateVoiceAgent,
  deleteVoiceAgent,
  addKnowledgeBase,
  uploadKnowledgeFile,
  trainVoiceAgent,
  getTrainingStatus
};
