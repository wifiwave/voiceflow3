/**
 * Play.ai API Authentication Module
 * 
 * This module handles authentication with the Play.ai API using the provided
 * User ID and API Key. It provides functions for generating authentication
 * headers and validating credentials.
 */

// Play.ai API credentials
const PLAY_AI_USER_ID = '806xCl1AM8gioiGbay9P65cyIDu1';
const PLAY_AI_API_KEY = 'ak-28c1d4f423d647698bb2f6ebbc6040fb';
const PLAY_AI_BASE_URL = 'https://api.play.ai/v1';

/**
 * Generate authentication headers for Play.ai API requests
 * @returns {Object} Headers object with authentication credentials
 */
export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'X-User-ID': PLAY_AI_USER_ID,
    'X-API-Key': PLAY_AI_API_KEY
  };
};

/**
 * Validate Play.ai API credentials by making a test request
 * @returns {Promise<boolean>} Promise resolving to true if credentials are valid
 * @throws {Error} If credentials are invalid or request fails
 */
export const validateCredentials = async () => {
  try {
    const response = await fetch(`${PLAY_AI_BASE_URL}/auth/validate`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to validate Play.ai credentials');
    }

    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Error validating Play.ai credentials:', error);
    throw error;
  }
};

/**
 * Get account information from Play.ai API
 * @returns {Promise<Object>} Promise resolving to account information
 * @throws {Error} If request fails
 */
export const getAccountInfo = async () => {
  try {
    const response = await fetch(`${PLAY_AI_BASE_URL}/account`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get account information');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting Play.ai account information:', error);
    throw error;
  }
};

/**
 * Initialize Play.ai API with provided credentials
 * @returns {Promise<Object>} Promise resolving to initialization status
 * @throws {Error} If initialization fails
 */
export const initializePlayAi = async () => {
  try {
    // Validate credentials
    const isValid = await validateCredentials();
    
    if (!isValid) {
      throw new Error('Invalid Play.ai credentials');
    }
    
    // Get account information
    const accountInfo = await getAccountInfo();
    
    return {
      initialized: true,
      accountInfo
    };
  } catch (error) {
    console.error('Error initializing Play.ai API:', error);
    throw error;
  }
};

export default {
  getAuthHeaders,
  validateCredentials,
  getAccountInfo,
  initializePlayAi,
  PLAY_AI_USER_ID,
  PLAY_AI_API_KEY,
  PLAY_AI_BASE_URL
};
