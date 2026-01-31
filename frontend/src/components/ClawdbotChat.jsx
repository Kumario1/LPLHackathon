import React, { useState, useRef, useEffect } from 'react';
import { clawdbotService } from '../api/clawdbotService';

/**
 * ClawdbotChat Component
 * 
 * A chat interface for interacting with the Clawdbot AI assistant
 * running on EC2. Connects to the backend database through the Clawdbot server.
 */
const ClawdbotChat = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hello! I'm Clawdbot, your Transition OS assistant. I can help you with:\n• Viewing dashboard and status\n• Managing households and clients\n• Completing tasks\n• Validating documents\n• Generating meeting packs\n\nWhat would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: userMessage, timestamp: new Date() },
    ]);

    setLoading(true);

    try {
      // Send to Clawdbot server
      const response = await clawdbotService.chat(userMessage);

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          type: 'bot',
          text: response.response,
          data: response.data,
          actions: response.actions_taken,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          type: 'error',
          text: `Error: ${err.message}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: '📊 Dashboard', message: "What's the dashboard status?" },
    { label: '🏠 Households', message: 'Show me all households' },
    { label: '✅ Complete Task', message: 'How do I complete a task?' },
    { label: '📄 Documents', message: 'Validate documents' },
  ];

  return (
    <div className="clawdbot-chat">
      <div className="chat-header">
        <h3>🤖 Clawdbot</h3>
        <span className="status-badge">Online</span>
      </div>

      <div className="quick-actions">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => setInput(action.message)}
            className="quick-action-btn"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="messages-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.type}`}>
            <div className="message-avatar">
              {msg.type === 'bot' && '🤖'}
              {msg.type === 'user' && '👤'}
              {msg.type === 'error' && '⚠️'}
            </div>
            <div className="message-content">
              <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </div>
              {msg.data && (
                <div className="message-data">
                  <small>Data received: {Object.keys(msg.data).join(', ')}</small>
                </div>
              )}
              <div className="message-time">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message bot loading">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="chat-input"
        />
        <button type="submit" disabled={loading || !input.trim()} className="send-btn">
          {loading ? '...' : 'Send'}
        </button>
      </form>

      <style>{`
        .clawdbot-chat {
          display: flex;
          flex-direction: column;
          height: 600px;
          border: 1px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .chat-header h3 {
          margin: 0;
          font-size: 18px;
        }
        
        .status-badge {
          background: rgba(255,255,255,0.2);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
        }
        
        .quick-actions {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          overflow-x: auto;
        }
        
        .quick-action-btn {
          padding: 8px 16px;
          border: 1px solid #dee2e6;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          font-size: 13px;
          white-space: nowrap;
          transition: all 0.2s;
        }
        
        .quick-action-btn:hover {
          background: #e9ecef;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f8f9fa;
        }
        
        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .message.user {
          flex-direction: row-reverse;
        }
        
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .message-content {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 16px;
          background: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .message.user .message-content {
          background: #667eea;
          color: white;
        }
        
        .message.error .message-content {
          background: #fee;
          color: #c00;
        }
        
        .message-text {
          line-height: 1.5;
          font-size: 14px;
        }
        
        .message-time {
          font-size: 11px;
          color: #999;
          margin-top: 4px;
        }
        
        .message.user .message-time {
          color: rgba(255,255,255,0.7);
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 0;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        .chat-input-form {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          background: white;
          border-top: 1px solid #e9ecef;
        }
        
        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #dee2e6;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
        }
        
        .chat-input:focus {
          border-color: #667eea;
        }
        
        .send-btn {
          padding: 12px 24px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        .send-btn:hover:not(:disabled) {
          background: #5568d3;
        }
        
        .send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default ClawdbotChat;
