// SimulationViewer - Core 3D viewport component
// Renders the Three.js scene, real GLB models, step-by-step HUD, spatial controls & audio

import { useRef, useEffect, useState, useCallback } from 'react'
import { useStore } from '../store'
import {
  SimulationRenderer,
  checkWebXRSupport,
  getStepProgress,
  simulationAudio,
  type TitrationState,
  type ApparatusScreenInfo,
} from '../engine/SimulationEngine'
import { formatSeconds } from '../data/curriculum'
import {
  Search,
  Eye,
  Pipette,
  Droplets,
  RotateCw,
  FileSpreadsheet,
  TrendingUp,
  Sparkles,
  Info,
  X,
  SlidersHorizontal,
  Hand,
  FlaskConical,
  RotateCcw,
} from 'lucide-react'

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
  const [arSupported, setArSupported] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [objectClicked, setObjectClicked] = useState<{ id: string; label: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadingItem, setLoadingItem] = useState('Initializing 3D Engine...')
  const [isAutoRotating, setIsAutoRotating] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // University Titration Practical Suite State
  const [titrationState, setTitrationState] = useState<TitrationState | null>(null)
  const [showMeniscusModal, setShowMeniscusModal] = useState(false)
  const [showCurveModal, setShowCurveModal] = useState(false)
  const [showWorksheetModal, setShowWorksheetModal] = useState(false)
  const [parallaxAngle, setParallaxAngle] = useState<'eye' | 'above' | 'below'>('eye')
  const [hoveredApparatus, setHoveredApparatus] = useState<{ id: string; label: string; desc: string | null } | null>(null)
  const [_pipettedAliquot, setPipettedAliquot] = useState(false)
  const [addedIndicator, setAddedIndicator] = useState(false)
  const handleApparatusClickRef = useRef<((id: string, label: string) => void) | null>(null)

  // 3D Spatial Floating Speech Bubble (Inspection HUD)
  const [activeBubble, setActiveBubble] = useState<ApparatusScreenInfo | null>(null)
  const [showToolDrawer, setShowToolDrawer] = useState(false)

  // University Stoichiometric Worksheet state
  const [vInitialInput, setVInitialInput] = useState('0.00')
  const [vFinalInput, setVFinalInput] = useState('')
  const [cAnalyteInput, setCAnalyteInput] = useState('')
  const [worksheetGrade, setWorksheetGrade] = useState<{
    submitted: boolean
    percentError: number
    grade: string
    isPass: boolean
    feedback: string
  } | null>(null)

  // ============================================================
  // INIT RENDERER & REAL MODELS
  // ============================================================

  useEffect(() => {
    if (!canvasRef.current || !activeSession) return

    setIsLoading(true)
    setLoadProgress(10)
    setLoadingItem('Loading 3D apparatus and shaders...')

    // WebXR check
    checkWebXRSupport().then((result) => {
      setXrStatus(result.message)
      setArSupported(result.arSupported)
    })

    // Renderer
    rendererRef.current = new SimulationRenderer({
      canvas: canvasRef.current,
      moduleId: activeSession.moduleId,
      onTitrationUpdate: (state) => {
        setTitrationState({ ...state })
      },
      onProgress: (pct, item) => {
        setLoadProgress(pct)
        setLoadingItem(`Loading ${item}...`)
      },
      onHoverChange: (id, label, desc) => {
        if (id) {
          setHoveredApparatus({ id, label: label || id, desc })
        } else {
          setHoveredApparatus(null)
        }
      },
      onApparatusScreenInfo: (info) => {
        if (info) {
          setActiveBubble(info)
        }
      },
      onObjectClick: (id, label) => {
        handleApparatusClickRef.current?.(id, label)
      },
      onLoad: () => {
        setIsLoading(false)
        setLoadProgress(100)
        simulationAudio.playSuccess()
        addNotification({
          kind: 'info',
          title: 'Laboratory Ready',
          message: 'Interact directly with the 3D apparatus or use the dock below.',
          duration: 4000,
        })
      },
    })

    return () => {
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
  }, [activeSession?.moduleId, addNotification])

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
    completeStep(idx, 88 + Math.round(Math.random() * 10))
    setShowHint(false)
    simulationAudio.playSuccess()

    if (isLast) {
      setSessionComplete(true)
    } else {
      advanceStep()
    }
  }, [activeSession, advanceStep, completeStep])

  const handleHint = useCallback(() => {
    setShowHint(true)
    useHint()
    simulationAudio.playClick()
  }, [useHint])

  const handleEndSession = useCallback(() => {
    endSession()
    onClose()
  }, [endSession, onClose])

  const handleToggleAutoRotate = useCallback(() => {
    if (!rendererRef.current) return
    const rotating = rendererRef.current.toggleAutoRotate()
    setIsAutoRotating(rotating)
    simulationAudio.playClick()
  }, [])

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled
    setSoundEnabled(next)
    simulationAudio.setEnabled(next)
    if (next) simulationAudio.playClick()
  }, [soundEnabled])

  const handleViewPreset = useCallback(
    (preset: 'front' | 'top' | 'side' | 'reset' | 'titration' | 'meniscus' | 'overview') => {
      if (!rendererRef.current) return
      rendererRef.current.setViewPreset(preset)
      simulationAudio.playClick()
    },
    []
  )

  const syncBuretteToWorksheet = useCallback(() => {
    if (titrationState) {
      setVFinalInput(titrationState.buretteReading.toFixed(2))
      simulationAudio.playClick()
    }
  }, [titrationState])

  const handleApparatusClick = useCallback(
    (id: string, label: string) => {
      setObjectClicked({ id, label })
      setTimeout(() => setObjectClicked(null), 3500)

      if (activeSession?.moduleId !== 'mod_science_001') return

      const stepIdx = activeSession.currentStepIndex

      if (id === 'burette') {
        setShowMeniscusModal(true)
        if (stepIdx === 0) {
          addNotification({
            kind: 'success',
            title: 'Class-A Burette Calibrated',
            message: 'Initial reading verified at 0.00 mL. Air bubbles expelled from capillary nozzle.',
            duration: 4000,
          })
          completeStep(0, 95)
          advanceStep()
        }
      } else if (id === 'pipette') {
        rendererRef.current?.pipetteAliquot()
        setPipettedAliquot(true)
        addNotification({
          kind: 'info',
          title: 'Aliquot Pipetted',
          message: 'Dispensed 25.00 mL Class-A aliquot of 0.0896 M HCl into conical flask.',
          duration: 4000,
        })
        if (stepIdx === 1 && addedIndicator) {
          completeStep(1, 96)
          advanceStep()
        }
      } else if (id === 'indicator') {
        rendererRef.current?.addIndicator()
        setAddedIndicator(true)
        addNotification({
          kind: 'info',
          title: 'Phenolphthalein Added',
          message: 'Added 3 drops of 0.1% phenolphthalein. Aliquot remains clear colorless in acid (pH 1.05).',
          duration: 4000,
        })
        if (stepIdx === 1) {
          setPipettedAliquot(true)
          completeStep(1, 95)
          advanceStep()
        }
      } else if (id === 'stopcock') {
        const nextFlow = rendererRef.current?.cycleStopcock()
        addNotification({
          kind: 'info',
          title: 'Stopcock Valve Rotated',
          message: `Flow rate set to: ${
            nextFlow === 'closed'
              ? 'Closed'
              : nextFlow === 'dropwise'
              ? 'Dropwise (1.3 drops/s)'
              : 'Fast Stream'
          }.`,
          duration: 3000,
        })
        if (stepIdx === 2 && nextFlow !== 'closed') {
          completeStep(2, 94)
          advanceStep()
        }
      } else if (id === 'flask') {
        rendererRef.current?.swirlFlask()
        if (titrationState?.isEndpoint) {
          addNotification({
            kind: 'success',
            title: 'Endpoint Confirmed! (pH 8.2 - 9.5)',
            message: 'Permanent delicate baby-pink color persisted for >30 seconds. Proceed to calculation.',
            duration: 5000,
          })
          if (stepIdx === 3) {
            completeStep(3, 98)
            advanceStep()
            setTimeout(() => {
              syncBuretteToWorksheet()
              setShowWorksheetModal(true)
            }, 800)
          }
        } else if (titrationState?.isOvershot) {
          addNotification({
            kind: 'warning',
            title: 'Over-Titrated Warning',
            message: 'Solution turned dark magenta/fuchsia! Excess NaOH added past equivalence point.',
            duration: 5000,
          })
        } else {
          addNotification({
            kind: 'info',
            title: 'Conical Flask Swirled',
            message: 'Solution homogenized. Acid neutralizes transient alkaline drops; remains colorless.',
            duration: 3000,
          })
        }
      } else if (id === 'wash_bottle') {
        rendererRef.current?.rinseNeck()
        addNotification({
          kind: 'info',
          title: 'Deionized Water Wash',
          message: 'Rinsed burette delivery tip and flask inner walls into aliquot. Total acid moles unchanged.',
          duration: 3500,
        })
      } else if (id === 'ceramic_tile') {
        addNotification({
          kind: 'info',
          title: 'Glazed Porcelain Contrast Tile',
          message: 'Neutral white ceramic tile provides optical contrast to detect faint baby-pink phenolphthalein endpoint transition.',
          duration: 4000,
        })
      } else if (id === 'waste_beaker') {
        addNotification({
          kind: 'info',
          title: 'Waste & Priming Beaker',
          message: 'Receives initial burette flush to clear trapped air bubbles from the capillary jet.',
          duration: 3500,
        })
      }
    },
    [
      activeSession,
      addedIndicator,
      completeStep,
      advanceStep,
      addNotification,
      titrationState,
      syncBuretteToWorksheet,
    ]
  )

  useEffect(() => {
    handleApparatusClickRef.current = handleApparatusClick
  }, [handleApparatusClick])

  const handleStartAR = useCallback(async () => {
    if (!rendererRef.current) return
    const started = await rendererRef.current.startARSession()
    if (!started) {
      addNotification({
        kind: 'warning',
        title: 'WebXR AR Notice',
        message: 'No compatible WebXR AR display or session detected.',
      })
    }
  }, [addNotification])

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }, [])

  const handleGradeWorksheet = useCallback(() => {
    const v1 = parseFloat(vInitialInput) || 0
    const v2 = parseFloat(vFinalInput) || 0
    const titre = Math.max(0, v2 - v1)
    const studentConc = parseFloat(cAnalyteInput) || 0
    const trueConc = 0.0896
    const calculatedTheoretical = (titre * 0.1) / 25.0

    if (studentConc <= 0) {
      addNotification({
        kind: 'warning',
        title: 'Input Required',
        message: 'Please calculate and enter the molarity of HCl.',
      })
      return
    }

    const percentError = Math.abs((studentConc - trueConc) / trueConc) * 100
    let grade = 'Needs Recalculation'
    let isPass = false
    let feedback = ''

    if (percentError <= 0.6) {
      grade = 'Grade A* (Distinction) - Class-A Analytical Precision'
      isPass = true
      feedback = `Outstanding quantitative precision! Titre volume ${titre.toFixed(2)} mL yielded [HCl] = ${studentConc.toFixed(4)} M with only ${percentError.toFixed(2)}% analytical error.`
    } else if (percentError <= 2.5) {
      grade = 'Grade A (Merit) - Strong Laboratory Competence'
      isPass = true
      feedback = `Excellent work! Your calculated molarity [HCl] = ${studentConc.toFixed(4)} M is within acceptable analytical error (${percentError.toFixed(2)}%).`
    } else if (percentError <= 5.0) {
      grade = 'Grade B (Pass)'
      isPass = true
      feedback = `Passing grade. Result [HCl] = ${studentConc.toFixed(4)} M is within general laboratory variance (${percentError.toFixed(2)}% error).`
    } else {
      grade = 'Recalculation Required'
      isPass = false
      feedback = `Error of ${percentError.toFixed(1)}% exceeds analytical standards. Hint: C_HCl = (0.1000 * ${titre.toFixed(2)}) / 25.00 = ${calculatedTheoretical.toFixed(4)} M.`
    }

    setWorksheetGrade({
      submitted: true,
      percentError,
      grade,
      isPass,
      feedback,
    })

    if (isPass) {
      simulationAudio.playSuccess()
      addNotification({
        kind: 'success',
        title: 'Stoichiometry Grade Awarded',
        message: grade,
      })
    } else {
      simulationAudio.playAlarm()
    }
  }, [vInitialInput, vFinalInput, cAnalyteInput, addNotification])

  if (!activeSession) return null

  const currentStep = activeSession.steps[activeSession.currentStepIndex]
  const progress = getStepProgress(activeSession.steps)
  const completedCount = activeSession.steps.filter((s) => s.isCompleted).length

  // ============================================================
  // SESSION COMPLETE MODAL
  // ============================================================

  if (sessionComplete) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 'var(--z-modal)',
          background: 'rgba(6, 8, 14, 0.96)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: 460,
            width: '100%',
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8) var(--space-6)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Score Circle */}
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'conic-gradient(var(--accent-bright) 0%, var(--status-success) 92%, var(--bg-surface-3) 92%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-6)',
              boxShadow: '0 0 24px rgba(56, 189, 248, 0.25)',
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
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
                  fontSize: '32px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                }}
              >
                {activeSession.score}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em' }}>
                SCORE
              </span>
            </div>
          </div>

          <h2
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-tight)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Session Complete
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
            Completed {completedCount} of {activeSession.totalSteps} steps in {formatSeconds(elapsedSeconds)}.
            {activeSession.hintsUsed > 0 && ` (${activeSession.hintsUsed} hint${activeSession.hintsUsed > 1 ? 's' : ''} consulted)`}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {[
              { label: 'Time', value: formatSeconds(elapsedSeconds) },
              { label: 'Steps', value: `${completedCount}/${activeSession.totalSteps}` },
              { label: 'Score', value: `${activeSession.score}%` },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: 'var(--bg-surface-2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-3)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-md" onClick={handleEndSession} style={{ width: '100%' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ============================================================
  // MAIN SIMULATION VIEWPORT
  // ============================================================

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        background: '#05070c',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)',
          background: 'rgba(8, 11, 20, 0.94)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-subtle)',
          zIndex: 20,
          flexShrink: 0,
          gap: 'var(--space-4)',
        }}
      >
        {/* Left: Exit & Module Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleEndSession}
            style={{ padding: '6px 12px', fontSize: 'var(--text-xs)', flexShrink: 0 }}
          >
            Exit
          </button>

          <div
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 6px #22c55e',
                flexShrink: 0,
              }}
            />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {activeSession.moduleName}
            </span>
          </div>
        </div>

        {/* Right: Step Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              Step {activeSession.currentStepIndex + 1}/{activeSession.totalSteps}
            </span>
            <div style={{ width: 56, height: 4, background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-bright))',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main 3D Viewport Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* WebGL Canvas */}
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

        {/* Floating 3D Tools Pill (Center Top) */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 15,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(8, 12, 22, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-full)',
            padding: '3px 6px',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleViewPreset('reset')}
            title="Reset Camera"
            style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
          >
            Reset
          </button>
          {activeSession.moduleId === 'mod_science_001' ? (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleViewPreset('titration')}
                title="Focus on Stopcock & Erlenmeyer Flask"
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-full)', color: '#38bdf8' }}
              >
                Titration Zone
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleViewPreset('meniscus')}
                title="Zoom into Class-A Burette Graduation Scale"
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-full)', color: '#a78bfa' }}
              >
                Meniscus Zoom
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleViewPreset('overview')}
                title="Overview of Complete Lab Bench"
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
              >
                Full Bench
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleViewPreset('front')}
                title="Front Angle"
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
              >
                Front
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleViewPreset('top')}
                title="Top Angle"
                style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
              >
                Top
              </button>
            </>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleToggleAutoRotate}
            title="Turntable 360° Orbit"
            style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-full)',
              background: isAutoRotating ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: isAutoRotating ? '#38bdf8' : 'var(--text-secondary)',
            }}
          >
            {isAutoRotating ? 'Orbiting' : 'Orbit'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleToggleSound}
            title={soundEnabled ? 'Audio Effects On' : 'Audio Muted'}
            style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
          >
            {soundEnabled ? 'Audio' : 'Muted'}
          </button>

          {arSupported ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleStartAR}
              title={xrStatus}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              AR Mode
            </button>
          ) : (
            <span
              title={xrStatus}
              style={{
                fontSize: '10px',
                padding: '3px 8px',
                color: 'var(--text-muted)',
              }}
            >
              3D
            </span>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleToggleFullscreen}
            title="Toggle Fullscreen"
            style={{ fontSize: '11px', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}
          >
            {isFullscreen ? 'Exit Full' : 'Full'}
          </button>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 7, 12, 0.92)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30,
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '3px solid rgba(255, 255, 255, 0.1)',
                borderTopColor: 'var(--accent-bright)',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <div style={{ textAlign: 'center', maxWidth: 360 }}>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {loadingItem}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Decoding real glTF meshes & PBR material maps ({loadProgress}%)
              </div>
            </div>
            <div style={{ width: 200, height: 4, background: 'rgba(255, 255, 255, 0.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${loadProgress}%`,
                  background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-bright))',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Step Guide HUD Panel */}
        <div
          style={{
            position: 'absolute',
            ...(activeSession.moduleId === 'mod_science_001'
              ? { top: '64px', left: 'var(--space-4)', maxWidth: 350 }
              : { bottom: 'var(--space-5)', left: 'var(--space-5)', maxWidth: 400 }),
            width: 'calc(100vw - 2.5rem)',
            animation: 'fadeInUp 0.3s var(--ease-out)',
            zIndex: 10,
          }}
        >
          <div
            className="sim-hud-panel"
            style={{
              padding: 'var(--space-5)',
              maxHeight: 'calc(100vh - 140px)',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-2)',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-bright)',
                }}
              >
                Step {currentStep.index + 1} of {activeSession.totalSteps}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  fontWeight: 600,
                }}
              >
                Interactive
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-base)',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
                lineHeight: 1.35,
                overflowWrap: 'break-word',
              }}
            >
              {currentStep.title}
            </h3>

            <p
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-3)',
                overflowWrap: 'break-word',
              }}
            >
              {currentStep.instruction}
            </p>

            {/* Direct Step Action for Titration */}
            {activeSession.moduleId === 'mod_science_001' && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                {activeSession.currentStepIndex === 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleApparatusClick('burette', '50.00 mL Class-A Burette')}
                    style={{ width: '100%', fontSize: '11px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Eye size={12} /> Inspect 0.00 mL Meniscus
                  </button>
                )}
                {activeSession.currentStepIndex === 1 && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleApparatusClick('pipette', '25.00 mL Volumetric Pipette')}
                      style={{ flex: 1, fontSize: '11px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <Pipette size={12} /> Pipette 25 mL
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleApparatusClick('indicator', 'Phenolphthalein Indicator')}
                      style={{ flex: 1, fontSize: '11px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                      <Droplets size={12} /> Add Indicator
                    </button>
                  </div>
                )}
                {activeSession.currentStepIndex === 2 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleApparatusClick('stopcock', 'PTFE Stopcock Valve')}
                    style={{ width: '100%', fontSize: '11px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <SlidersHorizontal size={12} /> Meter Stopcock Valve
                  </button>
                )}
                {activeSession.currentStepIndex === 3 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleApparatusClick('flask', 'Erlenmeyer Flask')}
                    style={{ width: '100%', fontSize: '11px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <RotateCw size={12} /> Swirl & Detect Endpoint
                  </button>
                )}
                {activeSession.currentStepIndex === 4 && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      syncBuretteToWorksheet()
                      setShowWorksheetModal(true)
                    }}
                    style={{ width: '100%', fontSize: '11px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <FileSpreadsheet size={12} /> Open Lab Worksheet
                  </button>
                )}
              </div>
            )}

            {/* Hint Box */}
            {showHint && (
              <div
                style={{
                  padding: 'var(--space-3)',
                  background: 'rgba(14, 165, 233, 0.08)',
                  border: '1px solid rgba(14, 165, 233, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-4)',
                  fontSize: 'var(--text-xs)',
                  color: '#7dd3fc',
                  lineHeight: 1.5,
                  overflowWrap: 'break-word',
                }}
              >
                <strong style={{ display: 'block', marginBottom: 2, color: '#38bdf8' }}>Guidance:</strong>
                {currentStep.hint}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {!showHint && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleHint}
                  style={{ fontSize: 'var(--text-xs)', padding: '7px 12px' }}
                >
                  View Hint
                </button>
              )}
              <button
                className="btn btn-primary btn-sm"
                onClick={handleStepComplete}
                style={{
                  flex: '1 1 140px',
                  fontSize: 'var(--text-xs)',
                  padding: '7px 14px',
                }}
              >
                {activeSession.currentStepIndex === activeSession.totalSteps - 1
                  ? 'Complete Practical'
                  : 'Proceed to Next Step'}
              </button>
            </div>
          </div>
        </div>

        {/* Selected Component Inspector Callout - Top Right */}
        {objectClicked && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              maxWidth: 300,
              width: 'calc(100vw - 2rem)',
              animation: 'fadeIn 0.2s ease',
              zIndex: 10,
            }}
          >
            <div
              className="sim-hud-panel"
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'rgba(8, 14, 26, 0.94)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 2 }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#38bdf8',
                  }}
                />
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                  Inspecting Component
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#ffffff', overflowWrap: 'break-word' }}>
                {objectClicked.label}
              </div>
            </div>
          </div>
        )}

        {/* Step Progress Indicators - Bottom Right */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-5)',
            right: 'var(--space-5)',
            zIndex: 10,
          }}
        >
          <div className="sim-hud-panel" style={{ padding: '8px 12px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {activeSession.steps.map((step, i) => (
                <div
                  key={step.id}
                  title={`Step ${i + 1}: ${step.title}`}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: step.isCompleted
                      ? '#22c55e'
                      : i === activeSession.currentStepIndex
                      ? '#38bdf8'
                      : 'rgba(255,255,255,0.18)',
                    transition: 'all 0.3s ease',
                    transform: i === activeSession.currentStepIndex ? 'scale(1.3)' : 'scale(1)',
                    boxShadow:
                      i === activeSession.currentStepIndex
                        ? '0 0 6px #38bdf8'
                        : step.isCompleted
                        ? '0 0 4px #22c55e'
                        : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Orbit Hint - Top Left */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            left: 'var(--space-4)',
            zIndex: 10,
          }}
        >
          <div
            className="sim-hud-panel"
            style={{
              padding: '5px 10px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            <span>Drag: Orbit</span>
            <span>&bull;</span>
            <span>Scroll: Zoom</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* UNIVERSITY TITRATION INTERACTIVE PRACTICAL SUITE              */}
        {/* ============================================================ */}

        {/* 1. Real-Time Telemetry Badge (Top Center) */}
        {activeSession.moduleId === 'mod_science_001' && titrationState && (
          <div
            style={{
              position: 'absolute',
              top: '52px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(9, 14, 26, 0.94)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <div
              onClick={() => setShowMeniscusModal(true)}
              title="Click to inspect Schellbach Meniscus"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Burette:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {titrationState.buretteReading.toFixed(2)} mL
                <Search size={11} color="#38bdf8" />
              </span>
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(255, 255, 255, 0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Dispensed:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                {titrationState.volumeAdded.toFixed(2)} mL
              </span>
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(255, 255, 255, 0.15)' }} />
            <div
              onClick={() => setShowCurveModal(true)}
              title="Click to view Live pH Titration Curve"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            >
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>pH:</span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: titrationState.currentPH > 8.2 ? '#f472b6' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {titrationState.currentPH.toFixed(2)}
                <TrendingUp size={11} color={titrationState.currentPH > 8.2 ? '#f472b6' : '#38bdf8'} />
              </span>
            </div>
            <div style={{ width: 1, height: 14, background: 'rgba(255, 255, 255, 0.15)' }} />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: titrationState.isEndpoint
                  ? 'rgba(34, 197, 94, 0.2)'
                  : titrationState.isOvershot
                  ? 'rgba(217, 4, 142, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${
                  titrationState.isEndpoint
                    ? '#22c55e'
                    : titrationState.isOvershot
                    ? '#d9048e'
                    : 'rgba(255, 255, 255, 0.1)'
                }`,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: titrationState.colorHex,
                  boxShadow: `0 0 6px ${titrationState.colorHex}`,
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: titrationState.isEndpoint
                    ? '#4ade80'
                    : titrationState.isOvershot
                    ? '#f472b6'
                    : 'var(--text-secondary)',
                }}
              >
                {titrationState.colorName}
              </span>
            </div>
          </div>
        )}

        {/* Floating Interactive Apparatus Cue (Bottom Center, above Dock) */}
        {activeSession.moduleId === 'mod_science_001' && (
          <div
            style={{
              position: 'absolute',
              bottom: titrationState?.activeTool !== 'none' ? '128px' : '78px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 14,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
              background: hoveredApparatus
                ? 'rgba(14, 165, 233, 0.22)'
                : 'rgba(15, 23, 42, 0.88)',
              border: `1px solid ${
                hoveredApparatus ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'
              }`,
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.25s ease',
              pointerEvents: 'none',
              maxWidth: 'calc(100vw - 3rem)',
            }}
          >
            {hoveredApparatus ? (
              <>
                <Sparkles size={12} color="#38bdf8" />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                  {hoveredApparatus.label}:
                </span>
                <span style={{ fontSize: '11px', color: '#7dd3fc' }}>
                  {hoveredApparatus.desc || 'Click directly to interact'}
                </span>
              </>
            ) : (
              <>
                <Info size={12} color="#38bdf8" />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  <strong style={{ color: '#e2e8f0' }}>Direct 3D Interaction:</strong> Drag stopcock to spin valve • Click equipment to pick up • Hover for scientific function
                </span>
              </>
            )}
          </div>
        )}

        {/* Active Portable Tool Staging Controls (Floats right above main dock when tool is held) */}
        {activeSession.moduleId === 'mod_science_001' && titrationState && titrationState.activeTool !== 'none' && (
          <div
            style={{
              position: 'absolute',
              bottom: '76px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 16,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid #38bdf8',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.25)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hand size={13} color="#38bdf8" />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff' }}>
                {titrationState.activeTool === 'wash_bottle' && 'LDPE Wash Bottle (DI Water)'}
                {titrationState.activeTool === 'indicator' && 'Phenolphthalein Indicator Bottle'}
                {titrationState.activeTool === 'pipette' && '25.00 mL Pipette & 3-Way Propipette Bulb'}
                {titrationState.activeTool === 'reagent_beaker' && '0.1000 M NaOH Reagent Beaker'}
                {titrationState.activeTool === 'litmus_strip' && 'Universal pH Test Strip & Tweezers'}
              </span>
            </div>

            <div style={{ width: 1, height: 16, background: 'rgba(255, 255, 255, 0.2)' }} />

            {/* Wash Bottle Controls */}
            {titrationState.activeTool === 'wash_bottle' && (
              <button
                className="btn btn-primary btn-sm"
                onMouseDown={() => rendererRef.current?.squeezeTool(true)}
                onMouseUp={() => rendererRef.current?.squeezeTool(false)}
                onTouchStart={() => rendererRef.current?.squeezeTool(true)}
                onTouchEnd={() => rendererRef.current?.squeezeTool(false)}
                onClick={() => {
                  rendererRef.current?.squeezeTool(true)
                  setTimeout(() => rendererRef.current?.squeezeTool(false), 500)
                }}
                style={{ fontSize: '11px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Droplets size={12} /> Squeeze Deionized Jet
              </button>
            )}

            {/* Indicator Dropper Controls */}
            {titrationState.activeTool === 'indicator' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  rendererRef.current?.squeezeTool(true)
                  setTimeout(() => rendererRef.current?.squeezeTool(false), 450)
                }}
                style={{ fontSize: '11px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Droplets size={12} /> Squeeze Dropper (+1 Drop)
              </button>
            )}

            {/* 3-Way Propipette Bulb Controls */}
            {titrationState.activeTool === 'pipette' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    simulationAudio.playPipetteSuction()
                    addNotification({ kind: 'info', title: 'Bulb Evacuated (Valve A)', message: 'Air expelled from propipette rubber bulb. Vacuum ready for aspiration.', duration: 2500 })
                  }}
                  style={{ fontSize: '10px', padding: '3px 7px' }}
                  title="Valve A: Evacuate Bulb Vacuum"
                >
                  Valve [A] Vac
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => rendererRef.current?.suctionPipette()}
                  style={{ fontSize: '10px', padding: '3px 8px' }}
                  title="Valve S: Suction 25.00 mL Aliquot"
                >
                  Valve [S] Suction
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => rendererRef.current?.dispensePipette()}
                  style={{ fontSize: '10px', padding: '3px 8px' }}
                  title="Valve E: Empty into Receiving Flask"
                >
                  Valve [E] Drain
                </button>
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#38bdf8', padding: '0 4px' }}>
                  {titrationState.pipetteVolume.toFixed(1)} mL
                </span>
              </div>
            )}

            {/* Reagent Beaker Tilt Slider */}
            {titrationState.activeTool === 'reagent_beaker' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>Tilt Beaker:</span>
                <input
                  type="range"
                  min="0"
                  max="70"
                  step="1"
                  value={titrationState.beakerTiltAngle}
                  onChange={(e) => rendererRef.current?.setBeakerTilt(parseFloat(e.target.value))}
                  style={{ width: '85px', accentColor: '#38bdf8' }}
                />
                <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: titrationState.beakerTiltAngle > 35 ? '#4ade80' : '#ffffff' }}>
                  {titrationState.beakerTiltAngle}° {titrationState.beakerTiltAngle > 35 ? '(Pouring!)' : ''}
                </span>
              </div>
            )}

            {/* Litmus Strip Controls */}
            {titrationState.activeTool === 'litmus_strip' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => rendererRef.current?.dipLitmusStrip()}
                  style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Sparkles size={11} /> Dip Strip in Liquid
                </button>
                {titrationState.litmusDipped && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 6px', background: 'rgba(0,0,0,0.4)', borderRadius: '4px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: titrationState.litmusColorHex, border: '1px solid #fff' }} />
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
                      pH {titrationState.currentPH.toFixed(1)} match
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => rendererRef.current?.putDownTool()}
              style={{ fontSize: '10px', padding: '3px 8px', color: '#94a3b8', borderRadius: 'var(--radius-full)' }}
            >
              Put Down
            </button>
          </div>
        )}

        {/* 2. Interactive Titration Control Dock (Bottom Center) */}
        {activeSession.moduleId === 'mod_science_001' && titrationState && (
          <div
            style={{
              position: 'absolute',
              bottom: 'var(--space-5)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 15,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(8, 12, 22, 0.94)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
              flexWrap: 'wrap',
              maxWidth: 'calc(100vw - 2rem)',
              justifyContent: 'center',
            }}
          >
            {/* Equipment Shelf Picker Toggle */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowToolDrawer((v) => !v)}
                style={{
                  fontSize: '11px',
                  padding: '5px 11px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: showToolDrawer ? 'rgba(56, 189, 248, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                  color: showToolDrawer ? '#38bdf8' : 'var(--text-primary)',
                }}
              >
                <Hand size={12} />
                <span>Equipment ({titrationState.activeTool !== 'none' ? 'In Hand' : 'Shelf'})</span>
              </button>

              {/* Equipment Drawer Popup */}
              {showToolDrawer && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '42px',
                    left: '0',
                    background: 'rgba(10, 16, 28, 0.96)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '12px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.65)',
                    minWidth: '220px',
                    zIndex: 30,
                  }}
                >
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, padding: '2px 6px' }}>
                    Pick Up Laboratory Tool
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      rendererRef.current?.pickUpTool('wash_bottle')
                      setShowToolDrawer(false)
                    }}
                    style={{ fontSize: '11px', justifyContent: 'flex-start', padding: '5px 8px' }}
                  >
                    <Droplets size={12} color="#38bdf8" style={{ marginRight: 6 }} /> Wash Bottle (Deionized Water)
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      rendererRef.current?.pickUpTool('indicator')
                      setShowToolDrawer(false)
                    }}
                    style={{ fontSize: '11px', justifyContent: 'flex-start', padding: '5px 8px' }}
                  >
                    <Droplets size={12} color="#f472b6" style={{ marginRight: 6 }} /> Phenolphthalein Indicator
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      rendererRef.current?.pickUpTool('pipette')
                      setShowToolDrawer(false)
                    }}
                    style={{ fontSize: '11px', justifyContent: 'flex-start', padding: '5px 8px' }}
                  >
                    <Pipette size={12} color="#4ade80" style={{ marginRight: 6 }} /> 25.00 mL Pipette & 3-Way Bulb
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      rendererRef.current?.pickUpTool('reagent_beaker')
                      setShowToolDrawer(false)
                    }}
                    style={{ fontSize: '11px', justifyContent: 'flex-start', padding: '5px 8px' }}
                  >
                    <FlaskConical size={12} color="#facc15" style={{ marginRight: 6 }} /> 0.1000 M NaOH Reagent Beaker
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      rendererRef.current?.pickUpTool('litmus_strip')
                      setShowToolDrawer(false)
                    }}
                    style={{ fontSize: '11px', justifyContent: 'flex-start', padding: '5px 8px' }}
                  >
                    <Sparkles size={12} color="#a855f7" style={{ marginRight: 6 }} /> Universal pH Litmus Paper
                  </button>
                </div>
              )}
            </div>

            <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.15)' }} />

            {/* Continuous Rotary Stopcock Valve Control */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <SlidersHorizontal size={12} color="#38bdf8" />
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#94a3b8' }}>Valve:</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8', minWidth: '28px' }}>
                  {titrationState.stopcockAngle.toFixed(0)}°
                </span>
              </div>

              {/* Angle fine step buttons */}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => rendererRef.current?.setStopcockAngle(titrationState.stopcockAngle - 5)}
                style={{ fontSize: '10px', padding: '2px 5px', minWidth: 20 }}
                title="Rotate -5°"
              >
                -5°
              </button>

              {/* Rotary Slider */}
              <input
                type="range"
                min="0"
                max="90"
                step="1"
                value={titrationState.stopcockAngle}
                onChange={(e) => rendererRef.current?.setStopcockAngle(parseFloat(e.target.value))}
                style={{ width: '70px', accentColor: '#38bdf8', cursor: 'ew-resize' }}
                title="Drag to rotate stopcock smoothly (0° - 90°)"
              />

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => rendererRef.current?.setStopcockAngle(titrationState.stopcockAngle + 5)}
                style={{ fontSize: '10px', padding: '2px 5px', minWidth: 20 }}
                title="Rotate +5°"
              >
                +5°
              </button>

              {/* Quick Flow Presets */}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => rendererRef.current?.setStopcockAngle(0)}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: titrationState.stopcockAngle === 0 ? 'rgba(239, 68, 68, 0.25)' : 'transparent',
                    color: titrationState.stopcockAngle === 0 ? '#f87171' : '#94a3b8',
                  }}
                >
                  Closed
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => rendererRef.current?.setStopcockAngle(22)}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: titrationState.stopcockAngle >= 8 && titrationState.stopcockAngle < 38 ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                    color: titrationState.stopcockAngle >= 8 && titrationState.stopcockAngle < 38 ? '#38bdf8' : '#94a3b8',
                  }}
                >
                  Drip
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => rendererRef.current?.setStopcockAngle(65)}
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: titrationState.stopcockAngle >= 38 ? 'rgba(234, 179, 8, 0.25)' : 'transparent',
                    color: titrationState.stopcockAngle >= 38 ? '#facc15' : '#94a3b8',
                  }}
                >
                  Stream
                </button>
              </div>
            </div>

            <div style={{ width: 1, height: 18, background: 'rgba(255, 255, 255, 0.15)' }} />

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => rendererRef.current?.swirlFlask()}
              style={{
                fontSize: '11px',
                padding: '4px 9px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: titrationState.isSwirling ? '#38bdf8' : 'var(--text-primary)',
                background: titrationState.isSwirling ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              }}
              title="Swirl conical flask to mix solution"
            >
              <RotateCw size={12} />
              <span>Swirl</span>
            </button>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowMeniscusModal(true)}
              style={{ fontSize: '11px', padding: '4px 9px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Parallax-Free Eye-Level Meniscus Magnifier"
            >
              <Eye size={12} />
              <span>Meniscus</span>
            </button>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowCurveModal(true)}
              style={{ fontSize: '11px', padding: '4px 9px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Live pH Titration Curve"
            >
              <TrendingUp size={12} />
              <span>pH Curve</span>
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                syncBuretteToWorksheet()
                setShowWorksheetModal(true)
              }}
              style={{ fontSize: '11px', padding: '4px 11px', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="University Stoichiometric Worksheet & Report"
            >
              <FileSpreadsheet size={12} />
              <span>Worksheet</span>
            </button>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => rendererRef.current?.resetTitration()}
              title="Reset titration volume to 0.00 mL"
              style={{ fontSize: '11px', padding: '4px 7px', borderRadius: 'var(--radius-full)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
            >
              <RotateCcw size={12} />
            </button>
          </div>
        )}

        {/* 3D Spatial Floating Speech Bubble (Inspection HUD with 4.5s Linger Countdown) */}
        {activeBubble && activeBubble.visible && (
          <div
            style={{
              position: 'absolute',
              left: Math.max(16, Math.min(window.innerWidth - 340, activeBubble.screenX - 160)),
              top: Math.max(70, Math.min(window.innerHeight - 220, activeBubble.screenY - 175)),
              zIndex: 25,
              width: 320,
              pointerEvents: 'auto',
              animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                position: 'relative',
                background: 'rgba(8, 14, 26, 0.96)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                borderRadius: '14px',
                padding: '14px 16px',
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 24px rgba(56, 189, 248, 0.15)',
              }}
            >
              {/* Pointer Arrow Tail pointing to 3D apparatus */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -7,
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: 14,
                  height: 14,
                  background: 'rgba(8, 14, 26, 0.96)',
                  borderRight: '1px solid rgba(56, 189, 248, 0.45)',
                  borderBottom: '1px solid rgba(56, 189, 248, 0.45)',
                }}
              />

              {/* Header with Category Badge and Dismiss */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    fontWeight: 700,
                  }}
                >
                  {activeBubble.category}
                </span>
                <button
                  onClick={() => setActiveBubble(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 2,
                    display: 'flex',
                  }}
                  title="Dismiss callout"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Apparatus Name */}
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', marginBottom: 6, lineHeight: 1.3 }}>
                {activeBubble.label}
              </div>

              {/* Scientific Purpose / Function ("What it does") */}
              <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.55, marginBottom: 10 }}>
                {activeBubble.description}
              </div>

              {/* Interaction Cue & Action Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Sparkles size={11} color="#38bdf8" />
                  {activeBubble.actionHint}
                </span>

                {['wash_bottle', 'indicator', 'pipette', 'reagent_beaker', 'litmus_paper'].includes(activeBubble.id) && (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const tool = activeBubble.id === 'litmus_paper' ? 'litmus_strip' : activeBubble.id
                      if (titrationState?.activeTool === tool) {
                        rendererRef.current?.putDownTool()
                      } else {
                        rendererRef.current?.pickUpTool(tool as any)
                      }
                    }}
                    style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '6px' }}
                  >
                    {titrationState?.activeTool === (activeBubble.id === 'litmus_paper' ? 'litmus_strip' : activeBubble.id)
                      ? 'Put Down'
                      : 'Pick Up'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Parallax-Free Meniscus Magnifier Modal */}
        {showMeniscusModal && titrationState && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(5, 7, 14, 0.88)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-4)',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 580,
                background: 'rgba(11, 16, 28, 0.96)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-bright)' }}>
                      Class-A Metrology Standard
                    </span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      DIN EN ISO 385
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#ffffff' }}>
                    Parallax-Free Meniscus Inspection
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Schellbach optical stripe: blue arrows meet at bottom of curved meniscus.
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowMeniscusModal(false)}
                  style={{ fontSize: '18px', padding: '4px 8px', lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>

              {/* Main Magnifier View */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '170px 1fr',
                  gap: 'var(--space-5)',
                  alignItems: 'center',
                  background: 'rgba(5, 8, 16, 0.7)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                {/* SVG Burette Tube Magnifier */}
                <div
                  style={{
                    height: 280,
                    width: 170,
                    background: '#0d131f',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="170" height="280" viewBox="0 0 170 280">
                    {/* Glass tube walls */}
                    <rect x="25" y="0" width="120" height="280" fill="#0f172a" />

                    {/* Schellbach white background band with central blue stripe */}
                    <rect x="65" y="0" width="40" height="280" fill="rgba(255, 255, 255, 0.95)" />
                    <rect x="82" y="0" width="6" height="280" fill="#0284c7" />

                    {/* Graduations & tick marks */}
                    {Array.from({ length: 29 }).map((_, idx) => {
                      const y = 20 + idx * 8.5
                      const isMajor = idx % 5 === 0
                      const isMid = idx % 5 === 2 || idx % 5 === 3
                      return (
                        <g key={idx}>
                          <line
                            x1={isMajor ? 32 : isMid ? 42 : 48}
                            y1={y}
                            x2={65}
                            y2={y}
                            stroke="#0f172a"
                            strokeWidth={isMajor ? 2.5 : 1.2}
                          />
                          {isMajor && (
                            <text
                              x="26"
                              y={y + 3.5}
                              fontSize="10"
                              fontFamily="monospace"
                              fontWeight="bold"
                              fill="#94a3b8"
                              textAnchor="end"
                            >
                              {(titrationState.buretteReading - 1.0 + idx * 0.1).toFixed(1)}
                            </text>
                          )}
                        </g>
                      )
                    })}

                    {/* Concave Meniscus Curve (adjusted by parallax angle) */}
                    {(() => {
                      const parallaxOffset = parallaxAngle === 'above' ? 14 : parallaxAngle === 'below' ? -12 : 0
                      const menY = 140 + parallaxOffset
                      return (
                        <g>
                          {/* Liquid volume below meniscus */}
                          <path
                            d={`M 25 ${menY} Q 85 ${menY + 14} 145 ${menY} L 145 280 L 25 280 Z`}
                            fill="rgba(56, 189, 248, 0.22)"
                          />

                          {/* Optical Schellbach Pinching (Two opposing blue arrows meeting at bottom) */}
                          <polygon points={`79,${menY - 14} 87,${menY - 14} 85,${menY + 12}`} fill="#0369a1" />
                          <polygon points={`79,${menY + 38} 87,${menY + 38} 85,${menY + 14}`} fill="#0369a1" />

                          {/* Meniscus curved boundary line */}
                          <path
                            d={`M 25 ${menY} Q 85 ${menY + 14} 145 ${menY}`}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.95)"
                            strokeWidth="2.5"
                          />

                          {/* Eye-level Horizontal Crosshair (Center at y = 140) */}
                          <line x1="0" y1="140" x2="170" y2="140" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
                          <circle cx="85" cy="140" r="3" fill="#ef4444" />
                        </g>
                      )
                    })()}
                  </svg>
                </div>

                {/* Parallax Mode Controls & Reading */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 2 }}>Observed Volumetric Reading</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 800, color: '#38bdf8' }}>
                      {(
                        titrationState.buretteReading +
                        (parallaxAngle === 'above' ? 0.18 : parallaxAngle === 'below' ? -0.15 : 0)
                      ).toFixed(2)}{' '}
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>mL</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>Parallax Perspective:</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setParallaxAngle('eye')}
                      style={{
                        justifyContent: 'flex-start',
                        fontSize: '11px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: parallaxAngle === 'eye' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        color: parallaxAngle === 'eye' ? '#4ade80' : 'var(--text-secondary)',
                        border: parallaxAngle === 'eye' ? '1px solid #22c55e' : '1px solid transparent',
                      }}
                    >
                      Eye Level (Parallax-Free: ±0.00 mL)
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setParallaxAngle('above')}
                      style={{
                        justifyContent: 'flex-start',
                        fontSize: '11px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: parallaxAngle === 'above' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        color: parallaxAngle === 'above' ? '#f87171' : 'var(--text-secondary)',
                        border: parallaxAngle === 'above' ? '1px solid #ef4444' : '1px solid transparent',
                      }}
                    >
                      View from Above (+0.18 mL Parallax Error)
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setParallaxAngle('below')}
                      style={{
                        justifyContent: 'flex-start',
                        fontSize: '11px',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        background: parallaxAngle === 'below' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        color: parallaxAngle === 'below' ? '#facc15' : 'var(--text-secondary)',
                        border: parallaxAngle === 'below' ? '1px solid #eab308' : '1px solid transparent',
                      }}
                    >
                      View from Below (-0.15 mL Parallax Error)
                    </button>
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      syncBuretteToWorksheet()
                      setShowMeniscusModal(false)
                      setShowWorksheetModal(true)
                    }}
                    style={{ marginTop: 'var(--space-2)' }}
                  >
                    Transfer to Lab Worksheet
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Live pH Titration Curve Modal */}
        {showCurveModal && titrationState && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(5, 7, 14, 0.88)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-4)',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 680,
                background: 'rgba(11, 16, 28, 0.96)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-bright)' }}>
                      Quantitative Electrochemistry
                    </span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      HCl (0.0896M) + NaOH (0.1000M)
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#ffffff' }}>
                    Live Analytical pH Titration Curve
                  </h3>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowCurveModal(false)}
                  style={{ fontSize: '18px', padding: '4px 8px', lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>

              {/* SVG Titration Curve Chart */}
              <div
                style={{
                  background: 'rgba(5, 8, 16, 0.75)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  overflowX: 'auto',
                }}
              >
                <svg width="600" height="300" viewBox="0 0 600 300" style={{ display: 'block', margin: '0 auto' }}>
                  {/* Grid lines */}
                  {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((phVal) => {
                    const y = 260 - (phVal / 14) * 220
                    return (
                      <g key={phVal}>
                        <line x1="60" y1={y} x2="560" y2={y} stroke={phVal === 7 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255,255,255,0.07)'} strokeWidth="1" strokeDasharray={phVal === 7 ? '4 4' : 'none'} />
                        <text x="48" y={y + 4} fontSize="10" fontFamily="monospace" fill={phVal === 7 ? '#38bdf8' : '#64748b'} textAnchor="end">
                          {phVal}
                        </text>
                      </g>
                    )
                  })}

                  {/* X axis volume gridlines */}
                  {[0, 10, 20, 22.4, 30, 40, 50].map((vVal) => {
                    const x = 60 + (vVal / 50) * 500
                    const isEquiv = Math.abs(vVal - 22.4) < 0.1
                    return (
                      <g key={vVal}>
                        <line x1={x} y1="40" x2={x} y2="260" stroke={isEquiv ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255,255,255,0.07)'} strokeWidth="1" strokeDasharray={isEquiv ? '4 4' : 'none'} />
                        <text x={x} y="278" fontSize="10" fontFamily="monospace" fill={isEquiv ? '#22c55e' : '#64748b'} textAnchor="middle">
                          {vVal.toFixed(isEquiv ? 1 : 0)}
                        </text>
                      </g>
                    )
                  })}

                  {/* Phenolphthalein Indicator Transition Band (pH 8.2 - 10.0) */}
                  <rect
                    x="60"
                    y={260 - (10.0 / 14) * 220}
                    width="500"
                    height={((10.0 - 8.2) / 14) * 220}
                    fill="rgba(244, 114, 182, 0.12)"
                    stroke="rgba(244, 114, 182, 0.25)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <text x="550" y={260 - (9.1 / 14) * 220} fontSize="9" fill="#f472b6" textAnchor="end" fontWeight="bold">
                    Phenolphthalein Transition (pH 8.2 - 10.0)
                  </text>

                  {/* Theoretical Titration Curve Path */}
                  <path
                    d={(() => {
                      return Array.from({ length: 101 }, (_, i) => {
                        const v = (i / 100) * 50
                        const molesH = 0.00224
                        const molesOH = v * 0.0001
                        const vTot = (25 + v) / 1000
                        let ph = 1.05
                        if (molesOH < molesH - 1e-6) {
                          ph = -Math.log10(Math.max(1e-7, (molesH - molesOH) / vTot))
                        } else if (Math.abs(molesOH - molesH) <= 1e-6) {
                          ph = 7.0
                        } else {
                          ph = 14 - (-Math.log10(Math.max(1e-7, (molesOH - molesH) / vTot)))
                        }
                        const x = 60 + (v / 50) * 500
                        const y = 260 - (Math.min(14, Math.max(0, ph)) / 14) * 220
                        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
                      }).join(' ')
                    })()}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />

                  {/* Equivalence Point Callout Dot */}
                  <circle cx={60 + (22.4 / 50) * 500} cy={260 - (7.0 / 14) * 220} r="4" fill="#22c55e" stroke="#ffffff" strokeWidth="1.5" />
                  <text x={60 + (22.4 / 50) * 500 + 8} y={260 - (7.0 / 14) * 220 + 4} fontSize="10" fill="#22c55e" fontWeight="bold">
                    Equivalence Pt (22.40 mL, pH 7.0)
                  </text>

                  {/* Live Student Operating Point Cursor */}
                  {(() => {
                    const curX = 60 + (Math.min(50, titrationState.volumeAdded) / 50) * 500
                    const curY = 260 - (Math.min(14, Math.max(0, titrationState.currentPH)) / 14) * 220
                    return (
                      <g>
                        <circle cx={curX} cy={curY} r="8" fill="none" stroke="#f472b6" strokeWidth="2" strokeDasharray="3 3">
                          <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={curX} cy={curY} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
                      </g>
                    )
                  })()}

                  {/* Axis labels */}
                  <text x="310" y="295" fontSize="11" fill="#94a3b8" textAnchor="middle" fontWeight="600">
                    Volume of 0.1000 M NaOH Titrant Added (mL)
                  </text>
                  <text x="18" y="150" fontSize="11" fill="#94a3b8" textAnchor="middle" transform="rotate(-90 18 150)" fontWeight="600">
                    Solution pH
                  </text>
                </svg>
              </div>

              {/* Status summary footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div>
                  Current Reading: <strong style={{ color: '#ffffff' }}>{titrationState.volumeAdded.toFixed(2)} mL</strong> | pH:{' '}
                  <strong style={{ color: titrationState.currentPH > 8.2 ? '#f472b6' : '#38bdf8' }}>{titrationState.currentPH.toFixed(2)}</strong>
                </div>
                <div style={{ color: titrationState.isEndpoint ? '#4ade80' : 'var(--text-muted)', fontWeight: 600 }}>
                  Status: {titrationState.colorName}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. University Stoichiometric Worksheet & Report Modal */}
        {showWorksheetModal && titrationState && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              background: 'rgba(5, 7, 14, 0.88)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-4)',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 620,
                background: 'rgba(11, 16, 28, 0.96)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-bright)' }}>
                      Laboratory Assessment
                    </span>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: 4, background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                      University Quantitative Standard
                    </span>
                  </div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: '#ffffff' }}>
                    Stoichiometric Calculation Worksheet
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Standardization reaction: HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowWorksheetModal(false)}
                  style={{ fontSize: '18px', padding: '4px 8px', lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>

              {/* Data Table */}
              <div
                style={{
                  background: 'rgba(5, 8, 16, 0.75)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Analyte Volume (HCl Pipetted)
                    </label>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                      25.00 mL (Class A)
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Standard Titrant Conc. [NaOH]
                    </label>
                    <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>
                      0.1000 M
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Initial Burette (V₁)
                    </label>
                    <input
                      type="text"
                      value={vInitialInput}
                      onChange={(e) => setVInitialInput(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 6,
                        color: '#ffffff',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Final Burette (V₂)
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        value={vFinalInput}
                        onChange={(e) => setVFinalInput(e.target.value)}
                        placeholder="e.g. 22.40"
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 6,
                          color: '#ffffff',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                        }}
                      />
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={syncBuretteToWorksheet}
                        title="Import Live Burette Reading"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        Sync
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Titre Volume (ΔV)
                    </label>
                    <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, fontSize: '13px', fontWeight: 700, color: '#38bdf8', fontFamily: 'monospace' }}>
                      {(Math.max(0, (parseFloat(vFinalInput) || 0) - (parseFloat(vInitialInput) || 0))).toFixed(2)} mL
                    </div>
                  </div>
                </div>

                {/* Calculation input */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 'var(--space-3)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff', display: 'block', marginBottom: '4px' }}>
                    Calculated Analyte Concentration: [HCl] = (C_NaOH × V_NaOH) / V_HCl
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={cAnalyteInput}
                      onChange={(e) => setCAnalyteInput(e.target.value)}
                      placeholder="Enter molarity e.g. 0.0896"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: 6,
                        color: '#ffffff',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                      }}
                    />
                    <button className="btn btn-primary btn-md" onClick={handleGradeWorksheet}>
                      Verify & Grade
                    </button>
                  </div>
                </div>
              </div>

              {/* Grade Report Feedback Panel */}
              {worksheetGrade && (
                <div
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    background: worksheetGrade.isPass ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${worksheetGrade.isPass ? '#22c55e' : '#ef4444'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: worksheetGrade.isPass ? '#4ade80' : '#f87171' }}>
                      {worksheetGrade.grade}
                    </span>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      Percent Error: ±{worksheetGrade.percentError.toFixed(2)}%
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5, margin: 0 }}>
                    {worksheetGrade.feedback}
                  </p>
                  {worksheetGrade.isPass && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setShowWorksheetModal(false)
                        handleStepComplete()
                      }}
                      style={{ marginTop: 'var(--space-3)', width: '100%' }}
                    >
                      Apply Practical Grade & Proceed
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
