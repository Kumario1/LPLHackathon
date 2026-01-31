/**
 * OpenClaw WebSocket Service
 * 
 * Connects to OpenClaw Gateway via WebSocket for real-time chat
 * URL: ws://44.222.228.231:18789
 */

const OPENCLAW_URL = import.meta.env.VITE_OPENCLAW_URL || 'ws://44.222.228.231:18789';

class OpenClawService {
  constructor() {
    this.ws = null;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.errorHandlers = [];
  }

  /**
   * Connect to OpenClaw Gateway
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(OPENCLAW_URL);

        this.ws.onopen = () => {
          console.log('✅ Connected to OpenClaw Gateway');
          this.connectionHandlers.forEach(h => h(true));
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messageHandlers.forEach(h => h(data));
          } catch (e) {
            this.messageHandlers.forEach(h => h({ type: 'text', content: event.data }));
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ OpenClaw WebSocket error:', error);
          this.errorHandlers.forEach(h => h(error));
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 Disconnected from OpenClaw Gateway');
          this.connectionHandlers.forEach(h => h(false));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send a message to OpenClaw
   */
  sendMessage(content, sessionKey = 'main') {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'message',
      sessionKey,
      content,
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * Subscribe to incoming messages
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(handler) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Subscribe to errors
   */
  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Disconnect from OpenClaw
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const openclawService = new OpenClawService();

export default openclawService;
