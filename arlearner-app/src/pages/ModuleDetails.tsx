// Module Details Page
// Shows curriculum metadata and launches the simulation

import { useStore } from '../store'
import { getModuleById, getDifficultyLabel, formatDuration } from '../data/curriculum'

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
        <div style={{ textAlign: 'center' }}>
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
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      {/* Hero Header */}
      <div
        style={{
          background: `linear-gradient(180deg, ${module.thumbnailColor}15 0%, var(--bg-base) 100%)`,
          padding: 'var(--space-16) 0 var(--space-10)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="container" style={{ maxWidth: 900 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onNavigate('explore')}
            style={{ marginBottom: 'var(--space-6)', padding: 0 }}
          >
            &larr; Back to Explore
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'flex-start' }}>
            {/* Left: Icon/Glow */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 'var(--radius-2xl)',
                background: `linear-gradient(135deg, ${module.thumbnailColor}33, ${module.thumbnailColor}11)`,
                border: `1px solid ${module.thumbnailColor}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 0 40px ${module.thumbnailColor}33`,
              }}
            >
              <span style={{ fontSize: '48px', fontWeight: 900, color: module.thumbnailColor, fontFamily: 'var(--font-sans)' }}>
                {module.domainSlug[0].toUpperCase()}
              </span>
            </div>

            {/* Right: Title & Meta */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <span className="badge" style={{ background: `${module.thumbnailColor}22`, color: module.thumbnailColor, borderColor: `${module.thumbnailColor}44` }}>
                  {module.domainName}
                </span>
                <span className="badge badge-neutral">
                  Level {module.difficulty} - {getDifficultyLabel(module.difficulty)}
                </span>
                <span className="badge badge-neutral">
                  {module.simulationType.toUpperCase()}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-4xl)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: 'var(--tracking-tight)',
                  lineHeight: 1.1,
                  marginBottom: 'var(--space-4)',
                }}
              >
                {module.title}
              </h1>
              <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                {module.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="container" style={{ maxWidth: 900, padding: 'var(--space-10) var(--space-6) var(--space-20)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-10)' }}>
          {/* Main Info */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Overview
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-8)' }}>
              {module.longDescription}
            </p>

            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
              Tags & Competencies
            </h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
              {module.tags.map((tag) => (
                <span key={tag} className="badge badge-neutral">#{tag}</span>
              ))}
            </div>
          </div>

          {/* Sidebar Action Card */}
          <div>
            <div
              className="card"
              style={{
                position: 'sticky',
                top: 'var(--space-24)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}
            >
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Duration</div>
                  <div style={{ fontWeight: 600 }}>{formatDuration(module.estimatedMinutes)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>Steps</div>
                  <div style={{ fontWeight: 600 }}>{module.totalSteps}</div>
                </div>
              </div>

              {/* Progress if started */}
              {progress && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Your Progress</span>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--accent-vivid)' }}>{pct}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${pct}%`, background: module.thumbnailColor }} />
                  </div>
                  {progress.passed && (
                    <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 800 }}>✓</span> Passed (Score: {progress.score})
                    </div>
                  )}
                </div>
              )}

              {/* Start CTA */}
              <button
                className="btn btn-xl"
                onClick={onStartSimulation}
                style={{
                  background: module.thumbnailColor,
                  color: '#fff',
                  boxShadow: `0 4px 16px ${module.thumbnailColor}66`,
                  width: '100%',
                }}
              >
                {pct > 0 && pct < 100 ? 'Resume Simulation' : pct === 100 ? 'Review Simulation' : 'Start Simulation'}
              </button>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
                Supports Desktop & WebXR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
