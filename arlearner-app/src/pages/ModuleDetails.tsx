// Module Details Page
// Shows curriculum metadata, real 3D equipment preview, and launches the simulation

import { useStore } from '../store'
import { getModuleById, getDifficultyLabel, formatDuration } from '../data/curriculum'
import DomainIcon from '../components/DomainIcon'
import { CheckCircle2 } from 'lucide-react'

interface ModuleDetailsProps {
  moduleId: string
  onNavigate: (page: string) => void
  onStartSimulation: () => void
}

export default function ModuleDetails({ moduleId, onNavigate, onStartSimulation }: ModuleDetailsProps) {
  const { progressRecords } = useStore()
  const module = getModuleById(moduleId)

  if (!module) {
    return (
      <div className="page" style={{ background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <h2>Module not found</h2>
          <button className="btn btn-primary" onClick={() => onNavigate('explore')} style={{ marginTop: 'var(--space-4)' }}>
            Back to Explore
          </button>
        </div>
      </div>
    )
  }

  const progress = progressRecords[module.id]
  const pct = progress?.completionPct ?? 0

  return (
    <div className="page" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      {/* Hero Header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${module.thumbnailColor}15 0%, var(--bg-base) 100%)`,
          padding: 'var(--space-10) 0 var(--space-8)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container" style={{ maxWidth: 1080 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('explore')}
            style={{ marginBottom: 'var(--space-5)', padding: '6px 12px' }}
          >
            ← Back to Explore
          </button>

          <div
            style={{
              display: 'flex',
              gap: 'var(--space-6)',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            {/* Left: Domain Apparatus Icon */}
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 'var(--radius-xl)',
                background: `linear-gradient(135deg, ${module.thumbnailColor}25, ${module.thumbnailColor}08)`,
                border: `1px solid ${module.thumbnailColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 8px 24px ${module.thumbnailColor}20`,
                color: module.thumbnailColor,
              }}
            >
              <DomainIcon slug={module.domainSlug} size={38} color={module.thumbnailColor} />
            </div>

            {/* Right: Title & Meta */}
            <div style={{ flex: '1 1 320px', minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: `${module.thumbnailColor}18`, color: module.thumbnailColor, borderColor: `${module.thumbnailColor}35` }}>
                  <DomainIcon slug={module.domainSlug} size={12} color={module.thumbnailColor} />
                  {module.domainName}
                </span>
                <span className="badge badge-neutral">
                  Level {module.difficulty} • {getDifficultyLabel(module.difficulty)}
                </span>
                <span className="badge badge-neutral">
                  {module.simulationType.toUpperCase()}
                </span>
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: 'var(--tracking-tight)',
                  lineHeight: 1.25,
                  marginBottom: 'var(--space-3)',
                  overflowWrap: 'break-word',
                  wordBreak: 'normal',
                }}
              >
                {module.title}
              </h1>

              <p
                style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  maxWidth: 780,
                }}
              >
                {module.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="container" style={{ maxWidth: 1080, padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}
        >
          {/* Main Info */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Overview & Objectives
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
              {module.longDescription}
            </p>

            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Curriculum Competencies
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
              {module.tags.map((tag) => (
                <span key={tag} className="badge badge-neutral">#{tag}</span>
              ))}
            </div>

            <div
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
              }}
            >
              <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                3D Interactive Apparatus
              </h4>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                This simulation provides high-fidelity 3D apparatus with WebXR support, procedural audio feedback, and component inspection.
              </p>
            </div>
          </div>

          {/* Sidebar Action Card */}
          <div>
            <div
              className="card"
              style={{
                position: 'sticky',
                top: 'calc(var(--nav-height) + var(--space-6))',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 3 }}>Estimated Time</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>{formatDuration(module.estimatedMinutes)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 3 }}>Interactive Steps</div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-md)' }}>{module.totalSteps} Steps</div>
                </div>
              </div>

              {/* Progress if started */}
              {progress && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Completion Progress</span>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-bright)' }}>{pct}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${pct}%`, background: module.thumbnailColor }} />
                  </div>
                  {progress.passed && (
                    <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={13} /> Passed (Score: {progress.score}%)
                    </div>
                  )}
                </div>
              )}

              {/* Start CTA */}
              <button
                className="btn btn-lg btn-primary"
                onClick={onStartSimulation}
                style={{
                  background: `linear-gradient(135deg, ${module.thumbnailColor}, ${module.thumbnailColor}cc)`,
                  border: 'none',
                  color: '#ffffff',
                  boxShadow: `0 4px 16px ${module.thumbnailColor}40`,
                  width: '100%',
                }}
              >
                {pct > 0 && pct < 100 ? 'Resume Simulation' : pct === 100 ? 'Review Simulation' : 'Start Practical Simulation'}
              </button>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
                Desktop 3D & WebXR AR Ready
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
