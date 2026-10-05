// Navigation component

import { useState, useEffect } from 'react'
import { useStore } from '../store'
import '../../src/styles/design-system.css'

interface NavProps {
  onNavigate: (page: string) => void
}

export default function Nav({ onNavigate }: NavProps) {
  const { user, activePage, isAuthenticated } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
        background: scrolled
          ? 'rgba(8, 8, 16, 0.95)'
          : 'rgba(8, 8, 16, 0.7)',
        borderBottomColor: scrolled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
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
              strokeWidth="1.5"
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
          }}
        >
          AR<span style={{ color: 'var(--accent-vivid)' }}>Learner</span>
        </span>
      </button>

      {/* Desktop links */}
      <ul className="nav-links" style={{ display: 'flex' }}>
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
              gap: 'var(--space-2)',
              padding: '4px 10px',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent-border)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-vivid)', letterSpacing: '0.06em' }}>
              LVL {user.level}
            </span>
            <span
              style={{
                width: '1px',
                height: '12px',
                background: 'var(--accent-border)',
              }}
            />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-vivid)' }}>
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
              gap: '4px',
              padding: '4px 10px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <span style={{ fontSize: '13px' }}>*</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24' }}>
              {user.streakDays}d
            </span>
          </div>
        )}

        {/* Avatar */}
        {isAuthenticated && user ? (
          <button
            onClick={() => onNavigate('profile')}
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-primary), var(--cyan-primary))',
              border: '2px solid var(--accent-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 'var(--text-sm)',
              color: 'white',
              flexShrink: 0,
            }}
          >
            {user.firstName[0]}{user.lastName[0]}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-md"
            onClick={() => onNavigate('login')}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  )
}
