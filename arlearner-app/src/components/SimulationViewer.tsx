// SimulationViewer - Core 3D viewport component
// Renders the Three.js scene and step-by-step HUD
// Patterns: IWSDK ECS-style, WebXR detection, Refero spatial UI tokens

import { useRef, useEffect, useState, useCallback } from 'react'
import { useStore } from '../store'
import { SimulationRenderer, checkWebXRSupport, getStepProgress } from '../engine/SimulationEngine'
import { formatSeconds } from '../data/curriculum'

interface SimulationViewerProps {
  onClose: () => void
}

export default function SimulationViewer({ onClose }: SimulationViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<SimulationRenderer | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const {
    activeSession,
    advanceStep,
    completeStep,
    useHint,
    endSession,
    addNotification,
  } = useStore()

  const [xrStatus, setXrStatus] = useState<string>('')
  const [showHint, setShowHint] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [objectClicked, setObjectClicked] = useState<string | null>(null)

  // ============================================================
  // INIT RENDERER
  // ============================================================

  useEffect(() => {
    if (!canvasRef.current || !activeSession) return

    // WebXR support check
    checkWebXRSupport().then((result) => {
      setXrStatus(result.message)
    })

    // Renderer
    rendererRef.current = new SimulationRenderer({
      canvas: canvasRef.current,
      moduleId: activeSession.moduleId,
      onObjectClick: (id) => {
        setObjectClicked(id)
        setTimeout(() => setObjectClicked(null), 3000)
      },
      onLoad: () => {
        addNotification({
          kind: 'info',
          title: 'Simulation Loaded',
          message: 'Use mouse to orbit. Click highlighted objects to interact.',
          duration: 4000,
        })
      },
    })

    return () => {
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
  }, [activeSession?.moduleId])

  // ============================================================
  // SYNC STEP HIGHLIGHT
  // ============================================================

  useEffect(() => {
    if (!activeSession || !rendererRef.current) return
    const currentStep = activeSession.steps[activeSession.currentStepIndex]
    if (currentStep) {
      rendererRef.current.highlightObject(currentStep.highlightObject)
      rendererRef.current.moveCameraTo(currentStep.cameraPosition)
    }
  }, [activeSession?.currentStepIndex])

  // ============================================================
  // TIMER
  // ============================================================

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleStepComplete = useCallback(() => {
    if (!activeSession) return
    const idx = activeSession.currentStepIndex
    const isLast = idx === activeSession.totalSteps - 1
    completeStep(idx, 85 + Math.round(Math.random() * 10))
    setShowHint(false)

    if (isLast) {
      setSessionComplete(true)
    } else {
      advanceStep()
    }
  }, [activeSession, advanceStep, completeStep])

  const handleHint = useCallback(() => {
    setShowHint(true)
    useHint()
  }, [useHint])

  const handleEndSession = useCallback(() => {
    endSession()
    onClose()
  }, [endSession, onClose])

  if (!activeSession) return null

  const currentStep = activeSession.steps[activeSession.currentStepIndex]
  const progress = getStepProgress(activeSession.steps)
  const completedCount = activeSession.steps.filter((s) => s.isCompleted).length

  // ============================================================
  // SESSION COMPLETE SCREEN
  // ============================================================

  if (sessionComplete) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-modal)',
          background: 'rgba(8,8,16,0.97)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.4s ease',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: 480,
            padding: 'var(--space-8)',
          }}
        >
          {/* Score ring */}
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'conic-gradient(var(--accent-primary) 0%, var(--accent-primary) 88%, var(--bg-surface-3) 88%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-8)',
              boxShadow: 'var(--shadow-glow)',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: '50%',
                background: 'var(--bg-surface-1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--text-3xl)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {activeSession.score}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
                SCORE
              </span>
            </div>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-tight)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Session Complete
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-8)' }}>
            You completed {completedCount} of {activeSession.totalSteps} steps in {formatSeconds(elapsedSeconds)}.
            {activeSession.hintsUsed > 0 && ` ${activeSession.hintsUsed} hint${activeSession.hintsUsed > 1 ? 's' : ''} used.`}
          </p>

          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-8)',
            }}
          >
            {[
              { label: 'Time', value: formatSeconds(elapsedSeconds) },
              { label: 'Steps', value: `${completedCount}/${activeSession.totalSteps}` },
              { label: 'Hints', value: activeSession.hintsUsed },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-xl)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-lg" onClick={handleEndSession} style={{ width: '100%' }}>
            Continue
          </button>
        </div>
      </div>
    )
  }

  // ============================================================
  // MAIN SIMULATION VIEW
  // ============================================================

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--space-4)',
          background: 'rgba(8,8,16,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border-subtle)',
          gap: 'var(--space-4)',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Close */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleEndSession}
          style={{ padding: '6px 10px', fontSize: 'var(--text-xs)' }}
        >
          Exit
        </button>

        {/* Module name */}
        <div
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activeSession.moduleName}
        </div>

        {/* Timer */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
          }}
        >
          {formatSeconds(elapsedSeconds)}
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Step {activeSession.currentStepIndex + 1} / {activeSession.totalSteps}
          </span>
          <div style={{ width: 80, height: 4, background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-bright))',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.5s var(--ease-out)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main content: canvas + HUD */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            cursor: 'grab',
          }}
        />

        {/* Step Panel - Bottom left */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-6)',
            left: 'var(--space-6)',
            maxWidth: 360,
            animation: 'fadeInUp 0.4s var(--ease-out)',
          }}
        >
          <div className="sim-hud-panel">
            {/* Step number */}
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
              Step {currentStep.index + 1} of {activeSession.totalSteps}
            </div>

            {/* Step title */}
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-lg)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-3)',
                letterSpacing: 'var(--tracking-tight)',
              }}
            >
              {currentStep.title}
            </h3>

            {/* Instruction */}
            <p
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {currentStep.instruction}
            </p>

            {/* Hint (if shown) */}
            {showHint && (
              <div
                style={{
                  padding: 'var(--space-3)',
                  background: 'rgba(124, 58, 237, 0.1)',
                  border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--accent-vivid)',
                  lineHeight: 'var(--leading-relaxed)',
                }}
              >
                <strong style={{ display: 'block', marginBottom: 2 }}>Hint:</strong>
                {currentStep.hint}
              </div>
            )}

            {/* Object clicked feedback */}
            {objectClicked && (
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--text-xs)',
                  color: '#4ade80',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                Interacted with: <strong>{objectClicked}</strong>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {!showHint && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleHint}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Show Hint
                </button>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={handleStepComplete}
                style={{ flex: 1, fontSize: 'var(--text-xs)' }}
              >
                {activeSession.currentStepIndex === activeSession.totalSteps - 1
                  ? 'Complete Session'
                  : 'Next Step'}
              </button>
            </div>
          </div>
        </div>

        {/* Step progress dots - Bottom right */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-6)',
            right: 'var(--space-6)',
          }}
        >
          <div className="sim-hud-panel" style={{ padding: 'var(--space-3) var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              {activeSession.steps.map((step, i) => (
                <div
                  key={step.id}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: step.isCompleted
                      ? 'var(--status-success)'
                      : i === activeSession.currentStepIndex
                      ? 'var(--accent-bright)'
                      : 'var(--bg-elevated)',
                    transition: 'background 0.3s ease, transform 0.3s ease',
                    transform: i === activeSession.currentStepIndex ? 'scale(1.4)' : 'scale(1)',
                    boxShadow: i === activeSession.currentStepIndex
                      ? '0 0 6px var(--accent-bright)'
                      : step.isCompleted
                      ? '0 0 4px var(--status-success)'
                      : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* WebXR status - Top right */}
        {xrStatus && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
            }}
          >
            <div
              className="sim-hud-panel"
              style={{ padding: '6px var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
            >
              {xrStatus.includes('supported') ? 'AR Ready' : '3D Mode'}
            </div>
          </div>
        )}

        {/* Orbit hint - Top left (first 5s) */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            left: 'var(--space-4)',
          }}
        >
          <div className="sim-hud-panel" style={{ padding: '6px var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Drag to orbit / Scroll to zoom
          </div>
        </div>
      </div>
    </div>
  )
}
