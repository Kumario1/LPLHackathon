/**
 * Clawdbot Service - Frontend API Client
 * 
 * This service connects the frontend to the Clawdbot server running on EC2.
 * It provides methods to interact with the AI assistant and access backend data.
 */

// Configuration - Clawdbot API on OpenClaw EC2
const CLAWDBOT_BASE_URL = import.meta.env.VITE_CLAWDBOT_URL || 'http://44.222.228.231:8080';

console.log('🔌 Clawdbot Service URL:', CLAWDBOT_BASE_URL);

/**
 * Make an API request to Clawdbot
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${CLAWDBOT_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.detail || error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Clawdbot Service API
 */
export const clawdbotService = {
  // ==================== Health ====================
  
  /**
   * Check if Clawdbot server is healthy
   */
  async healthCheck() {
    return apiRequest('/health');
  },

  // ==================== Chat Interface ====================

  /**
   * Send a natural language message to Clawdbot
   * @param {string} message - The user's message
   * @param {string} sessionId - Session ID for conversation context
   * @param {object} context - Additional context
   */
  async chat(message, sessionId = 'default', context = {}) {
    return apiRequest('/chat', {
      method: 'POST',
      body: {
        message,
        session_id: sessionId,
        context,
      },
    });
  },

  // ==================== Workflows ====================

  /**
   * Create a new workflow
   */
  async createWorkflow(workflowType, advisorId, metadata = {}) {
    return apiRequest('/workflows/create', {
      method: 'POST',
      body: {
        workflow_type: workflowType,
        advisor_id: advisorId,
        metadata,
      },
    });
  },

  /**
   * Get workflow details
   */
  async getWorkflow(workflowId) {
    return apiRequest(`/workflows/${workflowId}`);
  },

  // ==================== Households ====================

  /**
   * List all households
   */
  async listHouseholds(filters = {}) {
    const params = new URLSearchParams();
    if (filters.advisorId) params.append('advisor_id', filters.advisorId);
    if (filters.status) params.append('status', filters.status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/households${query}`);
  },

  /**
   * Get household details
   */
  async getHousehold(householdId) {
    return apiRequest(`/households/${householdId}`);
  },

  // ==================== Tasks ====================

  /**
   * Complete a task
   */
  async completeTask(taskId, note = '') {
    return apiRequest(`/tasks/${taskId}/complete`, {
      method: 'POST',
      body: { note },
    });
  },

  // ==================== Documents ====================

  /**
   * Validate a document for NIGO issues
   */
  async validateDocument(documentId, documentUrl = null) {
    return apiRequest('/documents/validate', {
      method: 'POST',
      body: { document_id: documentId, document_url: documentUrl },
    });
  },

  // ==================== Meeting Pack ====================

  /**
   * Generate a meeting pack for a household
   */
  async getMeetingPack(householdId) {
    return apiRequest(`/households/${householdId}/meeting-pack`);
  },

  // ==================== Predictions ====================

  /**
   * Get ETA prediction for a workflow
   */
  async getETA(workflowId) {
    return apiRequest(`/predictions/eta/${workflowId}`);
  },
};

/**
 * React Hook for using Clawdbot
 * Usage in components:
 * 
 *   const { sendMessage, loading, response, error } = useClawdbot();
 *   
 *   const handleSend = async (message) => {
 *     const result = await sendMessage(message);
 *     console.log(result);
 *   };
 */
export function useClawdbot() {
  // This is a placeholder for React hook implementation
  // The actual implementation would use useState, useCallback, etc.
  return {
    sendMessage: (msg) => clawdbotService.chat(msg),
    getHouseholds: () => clawdbotService.listHouseholds(),
    completeTask: (id, note) => clawdbotService.completeTask(id, note),
  };
}

export default clawdbotService;
