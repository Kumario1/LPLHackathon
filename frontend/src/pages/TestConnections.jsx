import React, { useState, useEffect, useRef } from 'react';
import { clawdbotService } from '../api/clawdbotService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://54.221.139.68:8000';
const CLAWDBOT_URL = import.meta.env.VITE_CLAWDBOT_URL || 'http://54.221.139.68:8080';
const OPENCLAW_URL = import.meta.env.VITE_OPENCLAW_URL || 'ws://54.221.139.68:18789';

export default function TestConnections() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [wsMessages, setWsMessages] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [chatInput, setChatInput] = useState('What is the dashboard status?');
  const wsRef = useRef(null);

  const addResult = (testName, result) => {
    setResults(prev => ({ ...prev, [testName]: result }));
  };

  const setTestLoading = (testName, isLoading) => {
    setLoading(prev => ({ ...prev, [testName]: isLoading }));
  };

  // Test 1: Backend Health
  const testBackendHealth = async () => {
    setTestLoading('backend-health', true);
    try {
      const res = await fetch(`${BACKEND_URL}/health/live`);
      const data = await res.json();
      addResult('backend-health', { success: true, data, url: `${BACKEND_URL}/health/live` });
    } catch (error) {
      addResult('backend-health', { success: false, error: error.message, url: `${BACKEND_URL}/health/live` });
    }
    setTestLoading('backend-health', false);
  };

  // Test 2: Backend API - List Households
  const testBackendHouseholds = async () => {
    setTestLoading('backend-households', true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/transitions`);
      const data = await res.json();
      addResult('backend-households', { success: true, data, count: data.length, url: `${BACKEND_URL}/api/transitions` });
    } catch (error) {
      addResult('backend-households', { success: false, error: error.message, url: `${BACKEND_URL}/api/transitions` });
    }
    setTestLoading('backend-households', false);
  };

  // Test 3: Clawdbot Health
  const testClawdbotHealth = async () => {
    setTestLoading('clawdbot-health', true);
    try {
      const data = await clawdbotService.healthCheck();
      addResult('clawdbot-health', { success: true, data, url: `${CLAWDBOT_URL}/health` });
    } catch (error) {
      addResult('clawdbot-health', { success: false, error: error.message, url: `${CLAWDBOT_URL}/health` });
    }
    setTestLoading('clawdbot-health', false);
  };

  // Test 4: Clawdbot Chat
  const testClawdbotChat = async () => {
    setTestLoading('clawdbot-chat', true);
    try {
      const data = await clawdbotService.chat(chatInput);
      addResult('clawdbot-chat', { success: true, data, url: `${CLAWDBOT_URL}/chat` });
    } catch (error) {
      addResult('clawdbot-chat', { success: false, error: error.message, url: `${CLAWDBOT_URL}/chat` });
    }
    setTestLoading('clawdbot-chat', false);
  };

  // Test 5: OpenClaw WebSocket
  const testOpenClawWS = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setTestLoading('openclaw-ws', true);
    setWsMessages([]);
    
    try {
      const ws = new WebSocket(OPENCLAW_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        addResult('openclaw-ws', { success: true, status: 'Connected', url: OPENCLAW_URL });
        setTestLoading('openclaw-ws', false);
        
        ws.send(JSON.stringify({
          type: 'message',
          content: 'Hello from frontend test!',
          sessionKey: 'test-session'
        }));
      };

      ws.onmessage = (event) => {
        setWsMessages(prev => [...prev, { time: new Date().toLocaleTimeString(), data: event.data }]);
      };

      ws.onerror = (error) => {
        setWsConnected(false);
        addResult('openclaw-ws', { success: false, error: 'WebSocket error', url: OPENCLAW_URL });
        setTestLoading('openclaw-ws', false);
      };

      ws.onclose = () => {
        setWsConnected(false);
      };
    } catch (error) {
      addResult('openclaw-ws', { success: false, error: error.message, url: OPENCLAW_URL });
      setTestLoading('openclaw-ws', false);
    }
  };

  const disconnectWS = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWsConnected(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    await testBackendHealth();
    await testBackendHouseholds();
    await testClawdbotHealth();
    await testClawdbotChat();
    testOpenClawWS();
  };

  useEffect(() => {
    return () => {
      disconnectWS();
    };
  }, []);

  const ResultCard = ({ title, testKey }) => {
    const result = results[testKey];
    const isLoading = loading[testKey];

    return (
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: 8, 
        padding: 16, 
        marginBottom: 12,
        background: result?.success ? '#f0fff0' : result ? '#fff0f0' : '#f9f9f9'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {isLoading && <span>⏳ Testing...</span>}
          {result?.success && <span style={{ color: 'green' }}>✅ PASS</span>}
          {result && !result.success && <span style={{ color: 'red' }}>❌ FAIL</span>}
        </div>
        
        {result?.url && (
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            URL: {result.url}
          </div>
        )}

        {result?.data && (
          <pre style={{ 
            background: '#f4f4f4', 
            padding: 10, 
            borderRadius: 4, 
            fontSize: 12,
            maxHeight: 200,
            overflow: 'auto',
            marginTop: 8
          }}>
            {JSON.stringify(result.data, null, 2)}
          </pre>
        )}

        {result?.error && (
          <div style={{ color: 'red', marginTop: 8, fontSize: 14 }}>
            Error: {result.error}
          </div>
        )}

        {result?.count !== undefined && (
          <div style={{ marginTop: 8, color: 'green' }}>
            Found: {result.count} items
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <h1>🔌 Connection Test Dashboard</h1>
      
      <div style={{ 
        background: '#f0f8ff', 
        padding: 16, 
        borderRadius: 8, 
        marginBottom: 24,
        fontSize: 14
      }}>
        <strong>Configured URLs:</strong><br/>
        Backend: {BACKEND_URL}<br/>
        Clawdbot: {CLAWDBOT_URL}<br/>
        OpenClaw: {OPENCLAW_URL}
      </div>

      <div style={{ marginBottom: 24 }}>
        <button 
          onClick={runAllTests}
          style={{ 
            padding: '12px 24px', 
            fontSize: 16, 
            background: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            marginRight: 12
          }}
        >
          🚀 Run All Tests
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h2>Backend Tests</h2>
          
          <div style={{ marginBottom: 12 }}>
            <button onClick={testBackendHealth} style={{ marginRight: 8 }}>Test Health</button>
            <button onClick={testBackendHouseholds}>Test Households API</button>
          </div>
          
          <ResultCard title="Backend Health" testKey="backend-health" />
          <ResultCard title="Backend Households" testKey="backend-households" />

          <h2 style={{ marginTop: 24 }}>Clawdbot Tests</h2>
          
          <div style={{ marginBottom: 12 }}>
            <button onClick={testClawdbotHealth} style={{ marginRight: 8 }}>Test Health</button>
          </div>
          
          <ResultCard title="Clawdbot Health" testKey="clawdbot-health" />

          <div style={{ marginTop: 16, marginBottom: 12 }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Enter message..."
              style={{ padding: 8, width: 300, marginRight: 8 }}
            />
            <button onClick={testClawdbotChat}>Send Chat</button>
          </div>
          
          <ResultCard title="Clawdbot Chat" testKey="clawdbot-chat" />
        </div>

        <div>
          <h2>OpenClaw WebSocket</h2>
          
          <div style={{ marginBottom: 12 }}>
            <button onClick={testOpenClawWS} style={{ marginRight: 8 }}>Connect WS</button>
            <button onClick={disconnectWS}>Disconnect</button>
          </div>

          <div style={{ 
            padding: 12, 
            borderRadius: 4, 
            background: wsConnected ? '#d4edda' : '#f8d7da',
            marginBottom: 12
          }}>
            Status: {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>

          <ResultCard title="WebSocket Connection" testKey="openclaw-ws" />

          {wsMessages.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3>WebSocket Messages:</h3>
              <div style={{ 
                maxHeight: 300, 
                overflow: 'auto', 
                border: '1px solid #ddd',
                borderRadius: 4,
                padding: 8
              }}>
                {wsMessages.map((msg, idx) => (
                  <div key={idx} style={{ 
                    padding: 8, 
                    borderBottom: '1px solid #eee',
                    fontSize: 12
                  }}>
                    <strong>{msg.time}</strong><br/>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.data}</pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
