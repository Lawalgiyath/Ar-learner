// Dashboard Page
// Learner hub with responsive grid, balanced metrics, crisp SVG icons, and clean card spacing

import { useStore } from '../store'
import { MODULES, DOMAINS, formatDuration, PLATFORM_STATS } from '../data/curriculum'
import DomainIcon from '../components/DomainIcon'

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
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-16)' }}>

        {/* Greeting Banner */}
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
            Learner Workspace
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
            Welcome, {user.firstName} {user.lastName}
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {user.institutionName} &bull; Level {user.level} &bull; {user.streakDays}-day active streak
          </p>
        </div>

        {/* Stat Cards Grid - Responsive */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-10)',
          }}
        >
          {[
            {
              value: `${user.xp.toLocaleString()} XP`,
              label: 'Total Experience',
              delta: '+120 XP this week',
              color: 'var(--accent-bright)',
            },
            {
              value: `${totalCompleted} of ${totalEnrolled}`,
              label: 'Modules Completed',
              delta: `${Math.round((totalCompleted / Math.max(1, totalEnrolled)) * 100)}% overall progress`,
              color: '#4ade80',
            },
            {
              value: avgScore > 0 ? `${avgScore}%` : 'N/A',
              label: 'Average Score',
              delta: avgScore >= 80 ? 'Target achieved' : 'In evaluation',
              color: avgScore >= 80 ? '#4ade80' : '#fbbf24',
            },
            {
              value: `${user.streakDays} Days`,
              label: 'Daily Streak',
              delta: 'Active daily learner',
              color: '#fbbf24',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat-card"
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
              }}
            >
              <div
                className="stat-value"
                style={{
                  color: stat.color,
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-xl)',
                  fontWeight: 800,
                  marginBottom: 'var(--space-1)',
                  lineHeight: 1.15,
                }}
              >
                {stat.value}
              </div>
              <div
                className="stat-label"
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  marginTop: 'var(--space-3)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                }}
              >
                {stat.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Two-Column Responsive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}
        >
          {/* Left: Continue Learning */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)',
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
                onClick={() => onNavigate('explore')}
                style={{ fontSize: 'var(--text-xs)', padding: '4px 10px' }}
              >
                View all &rarr;
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
                      background: 'var(--bg-surface-1)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      transition: 'all var(--duration-fast) var(--ease-out)',
                      textAlign: 'left',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--border-default)'
                      el.style.transform = 'translateY(-2px)'
                      el.style.boxShadow = 'var(--shadow-sm)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget
                      el.style.borderColor = 'var(--border-subtle)'
                      el.style.transform = 'none'
                      el.style.boxShadow = 'none'
                    }}
                  >
                    {/* Domain Icon Badge */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-md)',
                        background: `${module.thumbnailColor}18`,
                        border: `1px solid ${module.thumbnailColor}33`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: module.thumbnailColor,
                      }}
                    >
                      <DomainIcon slug={module.domainSlug} size={22} color={module.thumbnailColor} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                        <span
                          style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          {module.title}
                        </span>
                        {isCompleted && (
                          <span className="badge badge-success" style={{ fontSize: '10px', padding: '1px 6px', flexShrink: 0 }}>
                            Done
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            background: 'var(--bg-surface-3)',
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
                                : module.thumbnailColor,
                              borderRadius: 'var(--radius-full)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {pct}% &bull; {formatDuration(module.estimatedMinutes)}
                        </span>
                      </div>
                    </div>

                    <span style={{ color: 'var(--text-muted)', fontSize: '15px', flexShrink: 0 }}>&rarr;</span>
                  </button>
                )
              })}
            </div>

            {/* Explore Button */}
            <button
              onClick={() => onNavigate('explore')}
              style={{
                marginTop: 'var(--space-4)',
                width: '100%',
                padding: 'var(--space-4)',
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.24)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                color: 'var(--accent-bright)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                transition: 'all var(--duration-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.12)'
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)'
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.24)'
              }}
            >
              + Browse all 12 curriculum modules
            </button>
          </div>

          {/* Right: Sidebar Activity & Domains */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {/* Level Card */}
            <div
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Level {user.level} Progress
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-bright)', fontWeight: 600 }}>
                  {user.xp % 500} / 500 XP
                </span>
              </div>
              <div className="progress">
                <div
                  className="progress-bar"
                  style={{ width: `${(user.xp % 500) / 5}%`, background: 'linear-gradient(90deg, #0284c7, #38bdf8)' }}
                />
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
                {500 - (user.xp % 500)} XP to reach Level {user.level + 1}
              </p>
            </div>

            {/* Platform Activity Stats */}
            <div
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Platform Scale
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {[
                  { label: 'Active Learners', value: PLATFORM_STATS.totalLearners.toLocaleString() },
                  { label: 'Accredited Institutions', value: PLATFORM_STATS.totalInstitutions },
                  { label: 'Practical Modules Ready', value: PLATFORM_STATS.totalModules },
                  { label: 'Average Engagement', value: `${PLATFORM_STATS.averageEngagement}%` },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--space-2) 0',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      {stat.label}
                    </span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Domains Quick Access */}
            <div
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-5)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                Practical Disciplines
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => onNavigate('explore')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background var(--duration-fast)',
                      textAlign: 'left',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 'var(--radius-sm)',
                        background: `${domain.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: domain.color,
                        flexShrink: 0,
                      }}
                    >
                      <DomainIcon slug={domain.slug} size={14} color={domain.color} />
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {domain.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
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
