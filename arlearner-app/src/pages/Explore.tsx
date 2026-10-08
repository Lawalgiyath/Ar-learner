// Explore Page - Browse all domains and modules with responsive cards and clean typography

import { useState } from 'react'
import { DOMAINS, MODULES, getDifficultyLabel, formatDuration } from '../data/curriculum'
import type { Module, DomainSlug } from '../store'
import DomainIcon from '../components/DomainIcon'

interface ExploreProps {
  onNavigate: (page: string, moduleId?: string) => void
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#4ade80',
  2: '#fbbf24',
  3: '#f87171',
}

export default function Explore({ onNavigate }: ExploreProps) {
  const [activeSlug, setActiveSlug] = useState<DomainSlug | 'all'>('all')
  const [search, setSearch] = useState('')
  const [diffFilter, setDiffFilter] = useState<number | 0>(0)

  const filtered = MODULES.filter((m) => {
    const matchDomain = activeSlug === 'all' || m.domainSlug === activeSlug
    const matchSearch =
      search === '' ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchDiff = diffFilter === 0 || m.difficulty === diffFilter
    return matchDomain && matchSearch && matchDiff
  })

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>

        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--accent-bright)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Curriculum Catalog
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              marginBottom: 'var(--space-2)',
              overflowWrap: 'break-word',
            }}
          >
            Explore Practical Simulations
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 660, lineHeight: 1.6 }}>
            Master core vocational, medical, agricultural, and science laboratory skills in our 3D interactive learning engine with real-world equipment.
          </p>
        </div>

        {/* Domain Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-6)',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveSlug('all')}
            style={{
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid',
              borderColor: activeSlug === 'all' ? 'var(--accent-bright)' : 'var(--border-subtle)',
              background: activeSlug === 'all' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface-1)',
              color: activeSlug === 'all' ? '#38bdf8' : 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--duration-fast)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            All Disciplines ({MODULES.length})
          </button>
          {DOMAINS.map((d) => (
            <button
              key={d.slug}
              onClick={() => setActiveSlug(d.slug)}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: activeSlug === d.slug ? `${d.color}66` : 'var(--border-subtle)',
                background: activeSlug === d.slug ? `${d.color}18` : 'var(--bg-surface-1)',
                color: activeSlug === d.slug ? d.color : 'var(--text-secondary)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
              }}
            >
              <DomainIcon slug={d.slug} size={14} color={d.color} />
              <span>{d.name}</span>
            </button>
          ))}
        </div>

        {/* Search & Filter Row */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 420 }}>
            <input
              className="input"
              type="text"
              placeholder="Search equipment, tools, concepts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          {/* Difficulty Dropdown */}
          <select
            className="input"
            value={diffFilter}
            onChange={(e) => setDiffFilter(Number(e.target.value) as 0 | 1 | 2 | 3)}
            style={{ width: 140, cursor: 'pointer' }}
          >
            <option value={0}>All Levels</option>
            <option value={1}>Beginner</option>
            <option value={2}>Intermediate</option>
            <option value={3}>Advanced</option>
          </select>

          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
            Showing {filtered.length} module{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Responsive Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 310px), 1fr))',
            gap: 'var(--space-6)',
          }}
        >
          {filtered.map((module) => (
            <ModuleCard key={module.id} module={module} onNavigate={onNavigate} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-16)',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              background: 'var(--bg-surface-1)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            No modules match your current filter parameters.
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// MODULE CARD
// ============================================================

function ModuleCard({ module, onNavigate }: { module: Module; onNavigate: (page: string, id?: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const color = module.thumbnailColor
  const diffColor = DIFFICULTY_COLORS[module.difficulty]

  return (
    <button
      onClick={() => onNavigate('module', module.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg-surface-1)',
        border: `1px solid ${hovered ? `${color}55` : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'border-color var(--duration-fast), transform var(--duration-fast), box-shadow var(--duration-fast)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 28px rgba(0,0,0,0.45), 0 0 16px ${color}15` : 'none',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Banner Thumbnail with Clean Domain Icon */}
      <div
        style={{
          height: 104,
          background: `linear-gradient(135deg, ${color}18 0%, ${color}06 100%)`,
          borderBottom: `1px solid ${color}18`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Crisp Domain Icon with Soft Glow */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 'var(--radius-lg)',
            background: `${color}20`,
            border: `1px solid ${color}35`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            boxShadow: `0 4px 16px ${color}20`,
            zIndex: 1,
            transition: 'transform var(--duration-fast)',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          <DomainIcon slug={module.domainSlug} size={26} color={color} />
        </div>

        {/* Simulation Type Badge */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: 'var(--space-3)',
            zIndex: 2,
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(6, 8, 14, 0.88)',
              border: `1px solid ${color}35`,
              color,
              lineHeight: 1,
            }}
          >
            {module.simulationType.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Domain & Difficulty Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-2)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
            }}
          >
            {module.domainName}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: diffColor,
              lineHeight: 1.2,
            }}
          >
            {getDifficultyLabel(module.difficulty)}
          </span>
        </div>

        {/* Module Title */}
        <h3
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: 'var(--tracking-tight)',
            lineHeight: 1.32,
            marginBottom: 'var(--space-2)',
            overflowWrap: 'break-word',
          }}
        >
          {module.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            lineHeight: 1.55,
            marginBottom: 'var(--space-4)',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {module.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {module.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '10px',
                fontWeight: 500,
                padding: '2px 7px',
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                lineHeight: 1.3,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer Meta */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
          }}
        >
          <span>{formatDuration(module.estimatedMinutes)}</span>
          <span style={{ color: hovered ? color : 'var(--text-secondary)', fontWeight: 600 }}>
            {module.totalSteps} Steps &rarr;
          </span>
        </div>
      </div>
    </button>
  )
}
