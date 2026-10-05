// Explore Page - Browse all domains and modules

import { useState } from 'react'
import { DOMAINS, MODULES, getDifficultyLabel, formatDuration } from '../data/curriculum'
import type { Module, DomainSlug } from '../store'

interface ExploreProps {
  onNavigate: (page: string, moduleId?: string) => void
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#4ade80',
  2: '#fbbf24',
  3: '#f87171',
}

const DOMAIN_COLORS: Record<string, string> = {
  'virtual-science-lab': '#06b6d4',
  'vocational-skills': '#f59e0b',
  'medical-simulation': '#ef4444',
  'industrial-safety': '#f97316',
  'agricultural-simulation': '#22c55e',
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
      <div className="container" style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-16)' }}>

        {/* Header */}
        <div style={{ marginBottom: 'var(--space-10)' }}>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              letterSpacing: 'var(--tracking-widest)',
              textTransform: 'uppercase',
              color: 'var(--accent-vivid)',
              marginBottom: 'var(--space-2)',
            }}
          >
            5 learning domains
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 800,
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 'var(--space-3)',
            }}
          >
            Explore Simulations
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', maxWidth: 520 }}>
            Practise real procedures in a safe, immersive 3D environment. Every module is built to match industry standards.
          </p>
        </div>

        {/* Domain filter tabs */}
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
              padding: '6px var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid',
              borderColor: activeSlug === 'all' ? 'var(--accent-border)' : 'var(--border-default)',
              background: activeSlug === 'all' ? 'var(--accent-soft)' : 'var(--bg-surface-2)',
              color: activeSlug === 'all' ? 'var(--accent-vivid)' : 'var(--text-secondary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--duration-fast)',
            }}
          >
            All Modules ({MODULES.length})
          </button>
          {DOMAINS.map((d) => (
            <button
              key={d.slug}
              onClick={() => setActiveSlug(d.slug)}
              style={{
                padding: '6px var(--space-4)',
                borderRadius: 'var(--radius-full)',
                border: '1px solid',
                borderColor: activeSlug === d.slug ? `${d.color}55` : 'var(--border-default)',
                background: activeSlug === d.slug ? `${d.color}15` : 'var(--bg-surface-2)',
                color: activeSlug === d.slug ? d.color : 'var(--text-secondary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--duration-fast)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: d.color,
                  boxShadow: `0 0 4px ${d.color}`,
                }}
              />
              {d.name.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>

        {/* Search + filter row */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-8)',
            alignItems: 'center',
          }}
        >
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <input
              className="input"
              type="text"
              placeholder="Search modules, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 'var(--space-8)' }}
            />
            <span
              style={{
                position: 'absolute',
                left: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                fontSize: '14px',
                pointerEvents: 'none',
              }}
            >
              &#128269;
            </span>
          </div>

          {/* Difficulty filter */}
          <select
            className="input select"
            value={diffFilter}
            onChange={(e) => setDiffFilter(Number(e.target.value) as 0 | 1 | 2 | 3)}
            style={{ width: 160 }}
          >
            <option value={0}>All Levels</option>
            <option value={1}>Beginner</option>
            <option value={2}>Intermediate</option>
            <option value={3}>Advanced</option>
          </select>

          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filtered.length} module{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Module grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-5)',
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
              padding: 'var(--space-20)',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-base)',
            }}
          >
            No modules match your filters. Try adjusting your search.
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
        background: 'var(--bg-surface-2)',
        border: `1px solid ${hovered ? `${color}40` : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        overflow: 'hidden',
        transition: 'all var(--duration-base) var(--ease-out)',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${color}20` : 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top accent bar + thumbnail area */}
      <div
        style={{
          height: 120,
          background: `linear-gradient(135deg, ${color}1a 0%, ${color}08 100%)`,
          borderBottom: `1px solid ${color}20`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${color}15 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />
        {/* Glow orb */}
        <div
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `radial-gradient(${color}40, transparent 70%)`,
            filter: 'blur(20px)',
            transition: 'transform 0.4s ease',
            transform: hovered ? 'scale(1.4)' : 'scale(1)',
          }}
        />
        {/* Sim type badge */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: 'var(--space-3)',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(8,8,16,0.7)',
              border: `1px solid ${color}33`,
              color,
            }}
          >
            {module.simulationType === '3d-ar' ? '3D/AR' : module.simulationType === 'hybrid' ? 'Hybrid' : 'Guided'}
          </span>
        </div>

        {/* Domain icon text */}
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '32px',
            fontWeight: 900,
            color: `${color}60`,
            letterSpacing: '-0.05em',
            zIndex: 1,
          }}
        >
          {module.domainSlug[0].toUpperCase()}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-5)', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Domain + difficulty */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {module.domainName.split(' ').slice(0, 2).join(' ')}
          </span>
          <span style={{ fontSize: 'var(--text-muted)', color: 'var(--bg-elevated)' }}>&bull;</span>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: diffColor,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {getDifficultyLabel(module.difficulty)}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-md)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: 'var(--tracking-snug)',
            lineHeight: 1.3,
            marginBottom: 'var(--space-2)',
          }}
        >
          {module.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
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
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
          {module.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '10px',
                fontWeight: 500,
                padding: '2px 6px',
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer stats */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {formatDuration(module.estimatedMinutes)}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {module.totalSteps} steps
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {module.learnerCount.toLocaleString()} learners
            </span>
          </div>
          <span
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: module.averageScore >= 80 ? '#4ade80' : '#fbbf24',
            }}
          >
            Avg {module.averageScore}%
          </span>
        </div>
      </div>
    </button>
  )
}
