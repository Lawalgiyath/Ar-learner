// Toast Notification System

import { useEffect, useState } from 'react'
import { useStore } from '../store'
import type { Notification } from '../store'

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
    info:    '#06b6d4',
  }

  const bgMap: Record<string, string> = {
    success: 'rgba(34,197,94,0.1)',
    error:   'rgba(239,68,68,0.1)',
    warning: 'rgba(245,158,11,0.1)',
    info:    'rgba(6,182,212,0.1)',
  }

  const iconMap: Record<string, string> = {
    success: 'OK',
    error: '!!',
    warning: '!',
    info: 'i',
  }

  const color = colorMap[notification.kind]
  const bg = bgMap[notification.kind]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        padding: 'var(--space-4)',
        background: 'var(--bg-surface-2)',
        border: `1px solid ${color}33`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: '300px',
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
          fontSize: '11px',
          fontWeight: 700,
          color,
          flexShrink: 0,
        }}
      >
        {iconMap[notification.kind]}
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
