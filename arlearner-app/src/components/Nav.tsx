// Navigation component
// Clean header with glassmorphism, responsive navigation and status badges

import { useState, useEffect } from 'react'
import { useStore } from '../store'

interface NavProps {
  onNavigate: (page: string) => void
}

export default function Nav({ onNavigate }: NavProps) {
  const { user, activePage, isAuthenticated } = useStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'explore', label: 'Explore' },
    { id: 'my-learning', label: 'My Learning' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav
      className="nav"
      style={{
        background: scrolled ? 'rgba(6, 8, 14, 0.95)' : 'rgba(6, 8, 14, 0.82)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        transition: 'background var(--duration-base), border-color var(--duration-base)',
      }}
    >
      {/* Brand */}
      <button
        className="nav-brand"
        onClick={() => onNavigate('dashboard')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div className="nav-logo-mark">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z"
              fill="white"
              fillOpacity="0.9"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="rgba(8,8,16,0.8)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 800,
            letterSpacing: 'var(--tracking-tight)',
            fontSize: '18px',
          }}
        >
          AR<span style={{ color: 'var(--accent-bright)' }}>Learner</span>
        </span>
      </button>

      {/* Desktop links */}
      <ul className="nav-links">
        {links.map((link) => (
          <li key={link.id}>
            <button
              onClick={() => onNavigate(link.id)}
              className={`nav-link ${activePage === link.id ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="nav-actions">
        {/* XP Badge */}
        {isAuthenticated && user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-full)',
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-bright)', letterSpacing: '0.04em' }}>
              LVL {user.level}
            </span>
            <span
              style={{
                width: 1,
                height: 10,
                background: 'var(--accent-border)',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-bright)' }}>
              {user.xp.toLocaleString()} XP
            </span>
          </div>
        )}

        {/* Streak indicator */}
        {isAuthenticated && user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 9px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              borderRadius: 'var(--radius-full)',
              lineHeight: 1,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>
              {user.streakDays}d
            </span>
          </div>
        )}

        {/* Avatar */}
        {isAuthenticated && user ? (
          <button
            onClick={() => onNavigate('dashboard')}
            title={`${user.firstName} ${user.lastName}`}
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-vivid))',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              color: 'white',
              flexShrink: 0,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {user.firstName[0]}{user.lastName[0]}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('login')}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  )
}
