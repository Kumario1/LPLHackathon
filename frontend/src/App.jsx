import React, { useState, useEffect } from 'react';
import TestConnections from './pages/TestConnections';
import OpenClawChat from './components/OpenClawChat';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const CLAWDBOT_URL = import.meta.env.VITE_CLAWDBOT_URL || 'http://localhost:8080';
const OPENCLAW_URL = import.meta.env.VITE_OPENCLAW_URL || 'ws://localhost:18789';

function App() {
  const [page, setPage] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) setPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (p) => {
    setPage(p);
    window.location.hash = p;
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <nav
        style={{
          padding: '16px 24px',
          background: '#1a1a2e',
          color: 'white',
          display: 'flex',
          gap: 16,
        }}
      >
        <button onClick={() => navigate('home')} style={btnStyle(page === 'home')}>
          🏠 Home
        </button>
        <button onClick={() => navigate('test')} style={btnStyle(page === 'test')}>
          🔌 Test
        </button>
        <button onClick={() => navigate('chat')} style={btnStyle(page === 'chat')}>
          💬 OpenClaw Chat
        </button>
      </nav>

      <main style={{ padding: 24 }}>
        {page === 'home' && <HomePage />}
        {page === 'test' && <TestConnections />}
        {page === 'chat' && <OpenClawChat />}
      </main>
    </div>
  );
}

function btnStyle(active) {
  return {
    padding: '8px 16px',
    background: active ? '#4a4a6a' : 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
  };
}

function HomePage() {
  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1>🔄 Transition OS</h1>
      <p style={{ fontSize: 18, color: '#666' }}>AI-Powered Advisor Onboarding</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 24,
          maxWidth: 900,
          margin: '40px auto',
        }}
      >
        <Card
          title="🔌 Test Connections"
          desc="Test all service connections"
          onClick={() => (window.location.hash = 'test')}
        />
        <Card
          title="💬 OpenClaw Chat"
          desc="Talk to your OpenClaw agent"
          onClick={() => (window.location.hash = 'chat')}
        />
        <Card title="📊 Dashboard" desc="View transitions (coming soon)" onClick={() => {}} />
      </div>

      <div
        style={{
          marginTop: 40,
          padding: 20,
          background: '#f0f8ff',
          borderRadius: 8,
          maxWidth: 700,
          margin: '40px auto',
        }}
      >
        <h3>🌐 Configured Services</h3>
        <table style={{ margin: '0 auto', textAlign: 'left', fontSize: 14 }}>
          <tbody>
            <tr>
              <td style={{ padding: 8 }}>
                <strong>Backend:</strong>
              </td>
              <td>{BACKEND_URL}</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>
                <strong>OpenClaw:</strong>
              </td>
              <td>{OPENCLAW_URL}</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>
                <strong>Clawdbot:</strong>
              </td>
              <td>{CLAWDBOT_URL}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, desc, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 24,
        border: '1px solid #ddd',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      <h3>{title}</h3>
      <p style={{ color: '#666' }}>{desc}</p>
    </div>
  );
}

export default App;
