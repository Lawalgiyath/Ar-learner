// Toast Notification System
// Floating alerts with sleek status icons, glassmorphism, and balanced borders

import { useEffect, useState } from 'react'
import { useStore } from '../store'
import type { Notification } from '../store'

function ToastIcon({ kind, color }: { kind: string; color: string }) {
  if (kind === 'success') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (kind === 'error') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    )
  }
  if (kind === 'warning') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    )
  }
  // Info
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function Toast({ notification, onRemove }: { notification: Notification; onRemove: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const colorMap: Record<string, string> = {
    success: '#22c55e',
    error:   '#ef4444',
    warning: '#f59e0b',
    info:    '#38bdf8',
  }

  const bgMap: Record<string, string> = {
    success: 'rgba(34,197,94,0.12)',
    error:   'rgba(239,68,68,0.12)',
    warning: 'rgba(245,158,11,0.12)',
    info:    'rgba(56,189,248,0.12)',
  }

  const color = colorMap[notification.kind] ?? '#38bdf8'
  const bg = bgMap[notification.kind] ?? 'rgba(56,189,248,0.12)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: 'rgba(17, 24, 39, 0.94)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '280px',
        maxWidth: '380px',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
      onClick={onRemove}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-sm)',
          background: bg,
          border: `1px solid ${color}44`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        <ToastIcon kind={notification.kind} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
          }}
        >
          {notification.title}
        </div>
        {notification.message && (
          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              marginTop: '4px',
              lineHeight: 1.5,
            }}
          >
            {notification.message}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ToastContainer() {
  const { notifications, removeNotification } = useStore()

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 'var(--z-toast)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        pointerEvents: notifications.length === 0 ? 'none' : 'all',
      }}
    >
      {notifications.map((n) => (
        <Toast key={n.id} notification={n} onRemove={() => removeNotification(n.id)} />
      ))}
    </div>
  )
}
