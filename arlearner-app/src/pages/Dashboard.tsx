// Dashboard Page
// Main learner home screen inspired by Linear's information density

import { useStore } from '../store'
import { MODULES, DOMAINS, getDifficultyLabel, formatDuration, PLATFORM_STATS } from '../data/curriculum'

interface DashboardProps {
  onNavigate: (page: string, moduleId?: string) => void
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, progressRecords } = useStore()

  if (!user) return null

  const enrolledModules = MODULES.filter((m) => user.enrolledModules.includes(m.id))
  const recentActivity = enrolledModules.slice(0, 4)
  const totalCompleted = user.completedModules.length
  const totalEnrolled = user.enrolledModules.length
  const avgScore = Object.values(progressRecords).length > 0
    ? Math.round(
        Object.values(progressRecords)
          .filter((r) => r.score > 0)
          .reduce((s, r) => s + r.score, 0) /
        Math.max(1, Object.values(progressRecords).filter((r) => r.score > 0).length)
      )
    : 0

  return (
    <div className="page" style={{ background: 'var(--bg-base)' }}>
      <div className="container" style={{ paddingTop: 'var(--space-10)', paddingBottom: 'var(--space-16)' }}>

        {/* Greeting */}
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
            Welcome back
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-4xl)',
              fontWeight: 800,
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: 'var(--space-2)',
            }}
          >
            {user.firstName} {user.lastName}
          </h1>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
            {user.institutionName} &bull; Level {user.level} &bull; {user.streakDays} day streak
          </p>
        </div>

        {/* Stat Cards Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-10)',
          }}
        >
          {[
            {
              value: user.xp.toLocaleString(),
              label: 'Total XP',
              delta: '+120 this week',
              color: 'var(--accent-vivid)',
              glow: 'rgba(124,58,237,0.15)',
            },
            {
              value: `${totalCompleted}/${totalEnrolled}`,
              label: 'Modules Completed',
              delta: `${Math.round((totalCompleted / Math.max(1, totalEnrolled)) * 100)}% completion`,
              color: '#4ade80',
              glow: 'rgba(34,197,94,0.1)',
            },
            {
              value: avgScore > 0 ? `${avgScore}%` : 'N/A',
              label: 'Average Score',
              delta: avgScore >= 80 ? 'Above target' : 'Keep practising',
              color: avgScore >= 80 ? '#4ade80' : '#fbbf24',
              glow: 'rgba(245,158,11,0.1)',
            },
            {
              value: `${user.streakDays}d`,
              label: 'Learning Streak',
              delta: 'Keep it up!',
              color: '#fbbf24',
              glow: 'rgba(245,158,11,0.1)',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat-card"
              style={{
                background: 'var(--bg-base)',
                border: '2px solid var(--text-primary)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                className="stat-value"
                style={{ color: stat.color, fontFamily: 'var(--font-sans)' }}
              >
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
              <div
                style={{
                  marginTop: 'var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                {stat.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-8)' }}>

          {/* Left: Continue learning */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-5)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: 'var(--tracking-snug)',
                }}
              >
                Continue Learning
              </h2>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onNavigate('my-learning')}
              >
                View all
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentActivity.map((module) => {
                const progress = progressRecords[module.id]
                const pct = progress?.completionPct ?? 0
                const isCompleted = user.completedModules.includes(module.id)

                return (
                  <button
                    key={module.id}
                    onClick={() => onNavigate('module', module.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      padding: 'var(--space-4)',
                      background: 'var(--bg-surface-2)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xl)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-base) var(--ease-out)',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--border-default)'
                      el.style.transform = 'translateY(-2px)'
                      el.style.boxShadow = 'var(--shadow-md)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--border-subtle)'
                      el.style.transform = 'none'
                      el.style.boxShadow = 'none'
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-lg)',
                        background: `${module.thumbnailColor}1a`,
                        border: `1px solid ${module.thumbnailColor}33`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '20px',
                      }}
                    >
                      {module.domainSlug === 'virtual-science-lab' && '(S)'}
                      {module.domainSlug === 'medical-simulation' && '(M)'}
                      {module.domainSlug === 'vocational-skills' && '(V)'}
                      {module.domainSlug === 'industrial-safety' && '(I)'}
                      {module.domainSlug === 'agricultural-simulation' && '(A)'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {module.title}
                        </span>
                        {isCompleted && (
                          <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            Done
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {/* Progress bar */}
                        <div
                          style={{
                            flex: 1,
                            height: 3,
                            background: 'var(--bg-surface-4)',
                            borderRadius: 'var(--radius-full)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${pct}%`,
                              background: isCompleted
                                ? 'var(--status-success)'
                                : `linear-gradient(90deg, ${module.thumbnailColor}, ${module.thumbnailColor}cc)`,
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {pct}% &bull; {formatDuration(module.estimatedMinutes)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-surface-3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                        fontSize: '14px',
                      }}
                    >
                      &rarr;
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Explore new modules CTA */}
            <button
              onClick={() => onNavigate('explore')}
              style={{
                marginTop: 'var(--space-4)',
                width: '100%',
                padding: 'var(--space-4)',
                background: 'var(--accent-soft)',
                border: '1px dashed var(--accent-border)',
                borderRadius: 'var(--radius-xl)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                color: 'var(--accent-vivid)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                transition: 'background var(--duration-base)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(124,58,237,0.18)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent-soft)')}
            >
              + Explore more simulations
            </button>
          </div>

          {/* Right: Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

            {/* Level progress */}
            <div
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Level {user.level}
                </span>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--accent-vivid)',
                    fontWeight: 500,
                  }}
                >
                  {user.xp % 500} / 500 XP
                </span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${(user.xp % 500) / 5}%` }}
                />
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                {500 - (user.xp % 500)} XP to Level {user.level + 1}
              </p>
            </div>

            {/* Platform stats */}
            <div
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                Platform Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { label: 'Active Learners', value: PLATFORM_STATS.totalLearners.toLocaleString() },
                  { label: 'Institutions', value: PLATFORM_STATS.totalInstitutions },
                  { label: 'Simulation Modules', value: PLATFORM_STATS.totalModules },
                  { label: 'Avg Engagement', value: `${PLATFORM_STATS.averageEngagement}%` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: 'var(--space-3)',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {stat.label}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Domains summary */}
            <div
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                Learning Domains
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => onNavigate('explore')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background var(--duration-fast)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-3)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: domain.color,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${domain.color}80`,
                      }}
                    />
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', flex: 1 }}>
                      {domain.name}
                    </span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {domain.moduleCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
