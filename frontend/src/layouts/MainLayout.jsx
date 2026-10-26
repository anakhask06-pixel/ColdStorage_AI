
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Live Monitoring', path: '/live' },
  { label: 'Food Simulation', path: '/food-simulation' },
  { label: 'Alerts', path: '/alerts' },
  { label: 'Predictions', path: '/predictions' },
  { label: 'Reports', path: '/reports' },
];

function MainLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'inherit',
      }}
    >
      <header
        style={{
          background: '#102238',
          color: '#ffffff',
          padding: '28px 32px',
          borderBottom: '3px solid #0f766e',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
            }}
          >
            <span style={{ fontSize: '28px' }} aria-hidden="true">
              ❄️
            </span>
            <span
              style={{
                color: '#99f6e4',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Intelligent Cold Chain
            </span>
          </div>

          <h1
            style={{
              margin: '0 0 8px',
              color: '#ffffff',
              fontSize: 'clamp(24px, 3vw, 34px)',
              lineHeight: 1.25,
              letterSpacing: '-0.7px',
            }}
          >
            AI-Based Intelligent Cold Storage
          </h1>

          <p
            style={{
              margin: 0,
              color: '#cbd5e1',
              fontSize: '15px',
              lineHeight: 1.7,
            }}
          >
            Environmental Monitoring, AI Analysis &amp; Food Freshness
          </p>
        </div>
      </header>

      <nav
        aria-label="Main navigation"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 32px',
          background: '#ffffff',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '42px',
              padding: '10px 16px',
              borderRadius: '9px',
              border: isActive
                ? '1px solid #0f766e'
                : '1px solid transparent',
              textDecoration: 'none',
              color: isActive ? '#ffffff' : '#475569',
              background: isActive ? '#0f766e' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: '14px',
              whiteSpace: 'nowrap',
              transition: 'background 160ms ease, color 160ms ease',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main
        style={{
          width: '100%',
          maxWidth: '1464px',
          margin: '0 auto',
          padding: '24px',
          color: 'var(--text)',
        }}
      >
        {children}
      </main>

      <footer
        style={{
          marginTop: 'auto',
          padding: '18px 24px',
          borderTop: '1px solid var(--border)',
          background: '#ffffff',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        AI-Based Intelligent Cold Storage Monitoring System
        <span style={{ margin: '0 8px', color: '#cbd5e1' }}>•</span>
        Environmental Monitoring &amp; Food Freshness
      </footer>
    </div>
  );
}

export default MainLayout;
