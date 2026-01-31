import { useEffect, useState } from 'react';
import { openclawService } from '../api/openclawService';

const OpenClawChat = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "Hello! I'm OpenClaw. Try: 'show households' or 'complete task 12'.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribeMsg;
    let unsubscribeConn;
    let unsubscribeErr;

    openclawService
      .connect()
      .then(() => setConnected(true))
      .catch((err) => setError(err?.message || 'Failed to connect'));

    unsubscribeMsg = openclawService.onMessage((msg) => {
      const content = msg?.content || msg?.message || JSON.stringify(msg);
      setMessages((prev) => [...prev, { type: 'bot', text: content }]);
      setLoading(false);
    });

    unsubscribeConn = openclawService.onConnectionChange((state) => {
      setConnected(state);
      if (!state) setLoading(false);
    });

    unsubscribeErr = openclawService.onError((err) => {
      setError(err?.message || 'WebSocket error');
      setLoading(false);
    });

    return () => {
      if (unsubscribeMsg) unsubscribeMsg();
      if (unsubscribeConn) unsubscribeConn();
      if (unsubscribeErr) unsubscribeErr();
      openclawService.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { type: 'user', text: input }]);
    setLoading(true);
    setError(null);

    try {
      if (!openclawService.isConnected()) {
        await openclawService.connect();
      }
      openclawService.sendMessage(input);
    } catch (err) {
      setError(err?.message || 'Send failed');
      setLoading(false);
    }

    setInput('');
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h1>💬 Chat with OpenClaw</h1>

      <div style={{ marginBottom: 8, fontSize: 12, color: connected ? '#2c7a7b' : '#c53030' }}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {error && (
        <div style={{ color: '#c53030', marginBottom: 12, fontSize: 12 }}>Error: {error}</div>
      )}

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          height: 400,
          overflowY: 'auto',
          padding: 16,
          marginBottom: 16,
          background: '#f9f9f9',
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{ marginBottom: 12, textAlign: m.type === 'user' ? 'right' : 'left' }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: 16,
                background: m.type === 'user' ? '#007bff' : 'white',
                color: m.type === 'user' ? 'white' : 'black',
                border: m.type === 'user' ? 'none' : '1px solid #ddd',
                maxWidth: '80%',
                whiteSpace: 'pre-wrap',
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: '#666' }}>OpenClaw is typing...</div>}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 16,
            borderRadius: 4,
            border: '1px solid #ddd',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: '12px 24px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
          }}
        >
          Send
        </button>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        Try: "show households" or "complete task 12"
      </div>
    </div>
  );
};

export default OpenClawChat;
