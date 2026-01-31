import { useState } from 'react';
import TestConnections from './pages/TestConnections';
import ClawdbotChat from './components/ClawdbotChat';

function Navigation({ currentPage, setPage }) {
  const pages = [
    { id: 'home', label: '🏠 Home' },
    { id: 'test', label: '🔌 Test Connections' },
    { id: 'chat', label: '💬 Chat with Clawdbot' },
  ];

  return (
    <nav style={{ 
      padding: '16px 24px', 
      background: '#1a1a2e', 
      color: 'white',
      display: 'flex',
      gap: 16
    }}>
      {pages.map(page => (
        <button
          key={page.id}
          onClick={() => setPage(page.id)}
          style={{
            padding: '8px 16px',
            background: currentPage === page.id ? '#4a4a6a' : 'transparent',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          {page.label}
        </button>
      ))}
    </nav>
  );
}

function HomePage() {
  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h1>🔄 Transition OS</h1>
      <p style={{ fontSize: 18, color: '#666' }}>AI-Powered Advisor Onboarding</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: 24, 
        maxWidth: 900, 
        margin: '40px auto' 
      }}>
        <DashboardCard 
          title="🔌 Test Connections" 
          description="Test all service connections"
          link="#test"
        />
        <DashboardCard 
          title="💬 Chat" 
          description="Talk to Clawdbot"
          link="#chat"
        />
        <DashboardCard 
          title="📊 Dashboard" 
          description="View transition status (coming soon)"
          link="#"
        />
      </div>

      <div style={{ marginTop: 40, padding: 20, background: '#f0f8ff', borderRadius: 8 }}>
        <h3>🌐 Live Services</h3>
        <table style={{ margin: '0 auto', textAlign: 'left' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 16px' }}><strong>Backend API:</strong></td>
              <td style={{ padding: '8px 16px' }}>http://54.221.139.68:8000</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 16px' }}><strong>OpenClaw:</strong></td>
              <td style={{ padding: '8px 16px' }}>ws://44.222.228.231:18789</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 16px' }}><strong>Clawdbot:</strong></td>
              <td style={{ padding: '8px 16px' }}>http://44.222.228.231:8080</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DashboardCard({ title, description, link }) {
  return (
    <a 
      href={link}
      style={{
        display: 'block',
        padding: 24,
        border: '1px solid #ddd',
        borderRadius: 8,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'transform 0.2s, box-shadow 0.2s',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
    >
      <h3>{title}</h3>
      <p style={{ color: '#666' }}>{description}</p>
    </a>
  );
}

export default function App() {
  const [currentPage, setPage] = useState('home');

  // Simple hash-based routing
  const hash = window.location.hash.slice(1);
  const page = hash || currentPage;

  const renderPage = () => {
    switch (page) {
      case 'test':
        return <TestConnections />;
      case 'chat':
        return (
          <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <h1>💬 Chat with Clawdbot</h1>
            <ClawdbotChat />
          </div>
        );
      case 'home':
      default:
        return <HomePage />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <Navigation currentPage={page} setPage={(p) => { setPage(p); window.location.hash = p; }} />
      {renderPage()}
    </div>
  );
}
