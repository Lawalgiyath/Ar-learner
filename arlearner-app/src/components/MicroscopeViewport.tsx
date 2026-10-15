// MicroscopeViewport - Realistic Optical Specimen Viewport, Canvas Micrographs,
// Quantitative Micrometry Caliper, Cell Tally Counter & Snapshot Camera

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import {
  type MicroscopeState,
  SPECIMEN_CATALOG,
  getOpticalParameters,
  calculateFocalBlur,
} from '../engine/MicroscopeEngine'
import {
  Camera,
  Ruler,
  Hash,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  RotateCcw,
} from 'lucide-react'

interface MicroscopeViewportProps {
  state: MicroscopeState
  onUpdateState: (partial: Partial<MicroscopeState>) => void
  onCaptureSnapshot?: (dataUrl: string, caption: string) => void
  soundEnabled?: boolean
}

export const MicroscopeViewport: React.FC<MicroscopeViewportProps> = ({
  state,
  onUpdateState,
  onCaptureSnapshot,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showReticle, setShowReticle] = useState(true)
  const [caliperActive, setCaliperActive] = useState(false)
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null)
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number } | null>(null)
  const [measuredDistanceUm, setMeasuredDistanceUm] = useState<number | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Hemocytometer Multi-channel Cell Tally Counter
  const [tallyCounts, setTallyCounts] = useState<{ [channel: string]: number }>({
    Primary: 0,
    Secondary: 0,
    Abnormal: 0,
  })

  const currentSpecimen = SPECIMEN_CATALOG[state.activeSpecimen]
  const optical = useMemo(
    () => getOpticalParameters(state.objective, state.hasImmersionOil, state.irisAperture),
    [state.objective, state.hasImmersionOil, state.irisAperture]
  )

  const focusStatus = useMemo(
    () => calculateFocalBlur(state.coarseFocus, state.fineFocus, state.objective, state.hasImmersionOil),
    [state.coarseFocus, state.fineFocus, state.objective, state.hasImmersionOil]
  )

  // ============================================================
  // DRAW PROCEDURAL BIOLOGICAL SPECIMEN
  // ============================================================
  const drawSpecimen = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2
    const radius = Math.min(w, h) / 2 - 8

    // Clear canvas
    ctx.clearRect(0, 0, w, h)

    // Clip to circular field-of-view (Microscope Field Diaphragm)
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()

    // 1. Illuminator Transmitted Background
    const brightness = Math.max(0.08, state.lightIntensity / 100)
    const irisContrast = 1.0 - (state.irisAperture / 100) * 0.4
    const bgGradient = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius)
    bgGradient.addColorStop(0, `rgba(255, 252, 242, ${brightness * irisContrast})`)
    bgGradient.addColorStop(0.85, `rgba(240, 244, 250, ${brightness * 0.95})`)
    bgGradient.addColorStop(1, `rgba(180, 195, 215, ${brightness * 0.7})`)
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, w, h)

    // If slide is not mounted, show empty illuminated field
    if (!state.slideMounted) {
      ctx.fillStyle = 'rgba(100, 116, 139, 0.4)'
      ctx.font = '600 16px "Inter", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('NO SPECIMEN SLIDE MOUNTED', cx, cy - 10)
      ctx.font = '13px "Inter", sans-serif'
      ctx.fillStyle = 'rgba(100, 116, 139, 0.6)'
      ctx.fillText('Mount a specimen slide from the slide tray below', cx, cy + 18)
      ctx.restore()
      return
    }

    // Apply Stage Translation & Magnification Scaling
    ctx.save()
    ctx.translate(cx + state.stageX * 12, cy + state.stageY * 12)
    const magScale = (state.objective / 10) // 10x is baseline 1.0 scale
    ctx.scale(magScale, magScale)

    // Render Specimen based on ID
    switch (state.activeSpecimen) {
      case 'blood_smear': {
        // Human Peripheral Blood Smear (Wright-Giemsa)
        const isSickle = state.isSickleCellMode
        // Render 140 Erythrocytes in monolayer grid
        const cols = 14
        const rows = 10
        const spacing = 32

        for (let r = -rows / 2; r < rows / 2; r++) {
          for (let c = -cols / 2; c < cols / 2; c++) {
            const jitterX = Math.sin(c * 17 + r * 31) * 7
            const jitterY = Math.cos(c * 23 + r * 19) * 7
            const px = c * spacing + jitterX
            const py = r * spacing + jitterY

            const isAbnormalSickle = isSickle && (Math.abs(c * 7 + r * 3) % 4 === 0)

            ctx.save()
            ctx.translate(px, py)

            if (isAbnormalSickle) {
              // Sickle drepanocyte (crescent moon RBC)
              ctx.rotate(((c + r) * 45 * Math.PI) / 180)
              ctx.beginPath()
              ctx.moveTo(-16, -3)
              ctx.bezierCurveTo(-8, -12, 8, -12, 16, -3)
              ctx.bezierCurveTo(8, 2, -8, 2, -16, -3)
              ctx.fillStyle = '#dc2626'
              ctx.fill()
              ctx.lineWidth = 1.2
              ctx.strokeStyle = '#991b1b'
              ctx.stroke()
            } else {
              // Normal Biconcave Disc RBC (7.5 µm)
              ctx.beginPath()
              ctx.arc(0, 0, 11, 0, Math.PI * 2)
              ctx.fillStyle = '#ef4444'
              ctx.fill()
              ctx.lineWidth = 1
              ctx.strokeStyle = '#b91c1c'
              ctx.stroke()

              // Central Pallor
              ctx.beginPath()
              ctx.arc(0, 0, 5, 0, Math.PI * 2)
              ctx.fillStyle = 'rgba(254, 226, 226, 0.75)'
              ctx.fill()
            }
            ctx.restore()
          }
        }

        // Draw Multilobed Neutrophil (14 µm) at offset
        ctx.save()
        ctx.translate(45, -35)
        ctx.beginPath()
        ctx.arc(0, 0, 20, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(233, 213, 255, 0.9)'
        ctx.fill()
        ctx.strokeStyle = '#c084fc'
        ctx.stroke()

        // 3-Lobed Nucleus (Dark Purple Azure B)
        ctx.fillStyle = '#581c87'
        const lobes = [
          [-6, -6, 6],
          [7, -3, 5],
          [-2, 7, 6],
        ]
        lobes.forEach(([lx, ly, lr]) => {
          ctx.beginPath()
          ctx.arc(lx, ly, lr, 0, Math.PI * 2)
          ctx.fill()
        })
        ctx.restore()

        // Draw Small Lymphocyte (dense round nucleus)
        ctx.save()
        ctx.translate(-75, 45)
        ctx.beginPath()
        ctx.arc(0, 0, 14, 0, Math.PI * 2)
        ctx.fillStyle = '#7e22ce'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(0, 0, 16, 0, Math.PI * 2)
        ctx.strokeStyle = '#67e8f9'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()

        // Platelet thrombocyte clusters
        ctx.fillStyle = '#9333ea'
        const platelets = [
          [-20, -60],
          [-17, -64],
          [60, 50],
          [64, 48],
          [62, 54],
        ]
        platelets.forEach(([px, py]) => {
          ctx.beginPath()
          ctx.arc(px, py, 2.5, 0, Math.PI * 2)
          ctx.fill()
        })
        break
      }

      case 'onion_epidermis': {
        // Allium Cepa Epidermis (Iodine Stained)
        const cellW = 120
        const cellH = 46
        const isPlasmolysis = state.isPlasmolysisMode

        for (let r = -5; r <= 5; r++) {
          const xOffset = (r % 2) * (cellW / 2)
          for (let c = -4; c <= 4; c++) {
            const x = c * cellW + xOffset
            const y = r * cellH

            ctx.save()
            ctx.translate(x, y)

            // Rigid Cellulose Cell Wall (Outer Boundary)
            ctx.strokeStyle = '#b45309'
            ctx.lineWidth = 3.5
            ctx.strokeRect(2, 2, cellW - 4, cellH - 4)

            // Protoplast Interior
            if (isPlasmolysis) {
              // Shrunken plasmolysed protoplast pulled away from walls
              ctx.fillStyle = 'rgba(254, 243, 199, 0.7)'
              ctx.fillRect(16, 10, cellW - 32, cellH - 20)
              ctx.strokeStyle = '#d97706'
              ctx.lineWidth = 1.5
              ctx.strokeRect(16, 10, cellW - 32, cellH - 20)
            } else {
              // Turgid cell filling entire compartment
              ctx.fillStyle = 'rgba(254, 240, 138, 0.35)'
              ctx.fillRect(4, 4, cellW - 8, cellH - 8)
            }

            // Stained Nucleus with Nucleolus (Pushed to periphery)
            const nucX = cellW * 0.7
            const nucY = cellH * 0.4
            ctx.beginPath()
            ctx.arc(nucX, nucY, 7.5, 0, Math.PI * 2)
            ctx.fillStyle = '#92400e'
            ctx.fill()
            ctx.beginPath()
            ctx.arc(nucX + 1.5, nucY - 1.5, 2.5, 0, Math.PI * 2)
            ctx.fillStyle = '#451a03'
            ctx.fill()

            // Cytoplasmic strands
            ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(10, cellH / 2)
            ctx.lineTo(nucX, nucY)
            ctx.lineTo(cellW - 10, 10)
            ctx.stroke()

            ctx.restore()
          }
        }
        break
      }

      case 'gram_stain': {
        // Bacterial Gram Stain (Gram+ Purple Cocci vs Gram- Pink Bacilli)
        // Draw Gram+ S. aureus grape-like clusters
        ctx.fillStyle = '#4c1d95' // Deep Crystal Violet Purple
        const clusters = [
          [-40, -30],
          [60, 40],
          [-70, 50],
          [30, -60],
        ]
        clusters.forEach(([cx, cy]) => {
          for (let i = 0; i < 28; i++) {
            const angle = Math.random() * Math.PI * 2
            const dist = Math.random() * 22
            ctx.beginPath()
            ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 3.2, 0, Math.PI * 2)
            ctx.fill()
          }
        })

        // Draw Gram- E. coli Rods (Pink/Red Safranin)
        ctx.fillStyle = '#f43f5e'
        const bacilli = [
          [-10, 10, 0.4],
          [15, -15, -0.8],
          [-80, -40, 1.2],
          [80, -20, 0.2],
          [-25, 70, -0.3],
          [50, -80, 0.9],
          [100, 30, -0.6],
        ]
        bacilli.forEach(([bx, by, rot]) => {
          ctx.save()
          ctx.translate(bx, by)
          ctx.rotate(rot)
          ctx.beginPath()
          ctx.roundRect(-7, -2.5, 14, 5, 2.5)
          ctx.fill()
          ctx.strokeStyle = '#be123c'
          ctx.lineWidth = 0.8
          ctx.stroke()
          ctx.restore()
        })
        break
      }

      case 'cheek_epithelium': {
        // Buccal Squamous Epithelial Cells (Methylene Blue)
        const squamousCells = [
          [-50, -40, 0.2, 1.1],
          [40, 30, -0.4, 0.95],
          [-60, 60, 0.6, 1.05],
        ]

        squamousCells.forEach(([sx, sy, sRot, sScale]) => {
          ctx.save()
          ctx.translate(sx, sy)
          ctx.rotate(sRot)
          ctx.scale(sScale, sScale)

          // Polygonal irregular wavy plasma membrane
          ctx.beginPath()
          ctx.moveTo(-55, -20)
          ctx.bezierCurveTo(-45, -50, 20, -55, 50, -30)
          ctx.bezierCurveTo(65, -5, 55, 45, 25, 50)
          ctx.bezierCurveTo(-20, 55, -60, 35, -55, -20)
          ctx.fillStyle = 'rgba(186, 230, 253, 0.65)'
          ctx.fill()
          ctx.lineWidth = 1.8
          ctx.strokeStyle = '#0284c7'
          ctx.stroke()

          // Dark Central Nucleus
          ctx.beginPath()
          ctx.arc(4, 2, 9, 0, Math.PI * 2)
          ctx.fillStyle = '#0369a1'
          ctx.fill()
          ctx.beginPath()
          ctx.arc(6, 0, 3, 0, Math.PI * 2)
          ctx.fillStyle = '#0c4a6e'
          ctx.fill()

          // Tiny surface bacteria dots
          ctx.fillStyle = '#0284c7'
          for (let b = 0; b < 12; b++) {
            ctx.beginPath()
            ctx.arc((b * 11) % 40 - 20, (b * 17) % 40 - 20, 1.5, 0, Math.PI * 2)
            ctx.fill()
          }

          ctx.restore()
        })
        break
      }

      case 'allium_mitosis': {
        // Onion Root Tip Mitosis Squash
        const cellW = 50
        const cellH = 65

        const mitosisGrid = [
          [-2, -1, 'Interphase'],
          [-1, -1, 'Prophase'],
          [0, -1, 'Metaphase'],
          [1, -1, 'Anaphase'],
          [-2, 0, 'Telophase'],
          [-1, 0, 'Interphase'],
          [0, 0, 'Anaphase'],
          [1, 0, 'Metaphase'],
        ]

        mitosisGrid.forEach(([c, r, phase]) => {
          const x = (c as number) * (cellW + 6)
          const y = (r as number) * (cellH + 6)

          ctx.save()
          ctx.translate(x, y)

          // Rectangular cell box
          ctx.strokeStyle = '#991b1b'
          ctx.lineWidth = 2
          ctx.strokeRect(-cellW / 2, -cellH / 2, cellW, cellH)
          ctx.fillStyle = 'rgba(254, 205, 211, 0.4)'
          ctx.fillRect(-cellW / 2, -cellH / 2, cellW, cellH)

          // Chromosome graphics per phase
          ctx.fillStyle = '#881337' // Acetocarmine deep crimson
          ctx.strokeStyle = '#881337'
          ctx.lineWidth = 2.5

          if (phase === 'Interphase') {
            ctx.beginPath()
            ctx.arc(0, 0, 12, 0, Math.PI * 2)
            ctx.fill()
          } else if (phase === 'Prophase') {
            // Condensed spaghetti chromosomes
            for (let i = 0; i < 5; i++) {
              ctx.beginPath()
              ctx.arc(Math.cos(i) * 5, Math.sin(i) * 5, 8, 0, Math.PI * 1.5)
              ctx.stroke()
            }
          } else if (phase === 'Metaphase') {
            // Linear alignment along equatorial plate
            for (let i = -14; i <= 14; i += 7) {
              ctx.beginPath()
              ctx.moveTo(i, -6)
              ctx.lineTo(i, 6)
              ctx.stroke()
            }
          } else if (phase === 'Anaphase') {
            // Chromatids separating towards opposite poles
            [-12, 12].forEach((poleY) => {
              for (let i = -10; i <= 10; i += 7) {
                ctx.beginPath()
                ctx.moveTo(i, poleY - 3)
                ctx.lineTo(i, poleY + 3)
                ctx.stroke()
              }
            })
          } else if (phase === 'Telophase') {
            // Two reforming nuclei + cell plate line
            ctx.beginPath()
            ctx.arc(0, -14, 7, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.arc(0, 14, 7, 0, Math.PI * 2)
            ctx.fill()
            ctx.beginPath()
            ctx.moveTo(-16, 0)
            ctx.lineTo(16, 0)
            ctx.lineWidth = 1.5
            ctx.strokeStyle = '#475569'
            ctx.stroke()
          }

          ctx.restore()
        })
        break
      }

      case 'motor_neuron': {
        // Multipolar Spinal Motor Neuron with Nissl Bodies
        ctx.save()
        // Stellate Cell Body (Perikaryon)
        ctx.beginPath()
        ctx.moveTo(0, -50)
        ctx.bezierCurveTo(20, -25, 45, -35, 65, -15) // Dendrite 1
        ctx.bezierCurveTo(40, 5, 55, 30, 45, 55) // Dendrite 2
        ctx.bezierCurveTo(20, 45, 5, 40, -10, 65) // Axon hillock / axon
        ctx.bezierCurveTo(-25, 40, -45, 55, -60, 20) // Dendrite 3
        ctx.bezierCurveTo(-45, 0, -65, -20, -40, -35) // Dendrite 4
        ctx.closePath()
        ctx.fillStyle = 'rgba(216, 180, 254, 0.75)'
        ctx.fill()
        ctx.strokeStyle = '#7e22ce'
        ctx.lineWidth = 2.2
        ctx.stroke()

        // Basophilic Nissl bodies (Rough ER clumpy specks)
        ctx.fillStyle = '#581c87'
        for (let n = 0; n < 38; n++) {
          const nx = (Math.sin(n * 2.3) * 32)
          const ny = (Math.cos(n * 1.7) * 28)
          ctx.fillRect(nx, ny, 3.5, 2.5)
        }

        // Pale Vesicular Nucleus (Owl-eye)
        ctx.beginPath()
        ctx.arc(2, -4, 14, 0, Math.PI * 2)
        ctx.fillStyle = '#faf5ff'
        ctx.fill()
        ctx.strokeStyle = '#6b21a8'
        ctx.stroke()

        // Dark Nucleolus
        ctx.beginPath()
        ctx.arc(4, -5, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#3b0764'
        ctx.fill()

        // Surrounding small glial cells
        ctx.fillStyle = '#4c1d95'
        const glia = [
          [-85, -60],
          [90, 70],
          [-75, 75],
          [80, -65],
          [-20, -90],
        ]
        glia.forEach(([gx, gy]) => {
          ctx.beginPath()
          ctx.arc(gx, gy, 4, 0, Math.PI * 2)
          ctx.fill()
        })

        ctx.restore()
        break
      }
    }

    ctx.restore() // Undo stage translation & scaling

    // 2. Optical Vignette Rim & Eyepiece Frame
    const vignetteGrad = ctx.createRadialGradient(cx, cy, radius * 0.75, cx, cy, radius)
    vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)')
    vignetteGrad.addColorStop(0.85, 'rgba(15, 23, 42, 0.45)')
    vignetteGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)')
    ctx.fillStyle = vignetteGrad
    ctx.fillRect(0, 0, w, h)

    // 3. Eyepiece Circular Diaphragm Frame (Black border surrounding ocular circle)
    ctx.restore() // Undo circular clip

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, w, h)
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true)
    ctx.fillStyle = '#06080e'
    ctx.fill()

    // Ocular Bezel Ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.lineWidth = 5
    ctx.strokeStyle = '#334155'
    ctx.stroke()

    // 4. Ocular Micrometer Reticle Overlay (if enabled)
    if (showReticle) {
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.45)'
      ctx.lineWidth = 1
      // Horizontal & Vertical Crosshairs
      ctx.beginPath()
      ctx.moveTo(cx - radius * 0.85, cy)
      ctx.lineTo(cx + radius * 0.85, cy)
      ctx.moveTo(cx, cy - radius * 0.85)
      ctx.lineTo(cx, cy + radius * 0.85)
      ctx.stroke()

      // 100-division graduated scale ticks along horizontal axis
      const totalTicks = 50
      const tickSpacing = (radius * 1.6) / totalTicks
      const startX = cx - radius * 0.8
      for (let i = 0; i <= totalTicks; i++) {
        const tx = startX + i * tickSpacing
        const isMajor = i % 10 === 0
        const isMed = i % 5 === 0
        const tLen = isMajor ? 12 : isMed ? 7 : 4

        ctx.beginPath()
        ctx.moveTo(tx, cy - tLen)
        ctx.lineTo(tx, cy + tLen)
        ctx.stroke()

        if (isMajor && i > 0 && i < totalTicks) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.85)'
          ctx.font = '10px "JetBrains Mono", monospace'
          ctx.textAlign = 'center'
          ctx.fillText(`${i * 2}`, tx, cy + 22)
        }
      }
    }

    // 5. Active Caliper Tool Line
    if (caliperStart && caliperEnd) {
      ctx.strokeStyle = '#f43f5e'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(caliperStart.x, caliperStart.y)
      ctx.lineTo(caliperEnd.x, caliperEnd.y)
      ctx.stroke()
      ctx.setLineDash([])

      // Endpoints
      ctx.fillStyle = '#f43f5e'
      ctx.beginPath()
      ctx.arc(caliperStart.x, caliperStart.y, 4.5, 0, Math.PI * 2)
      ctx.arc(caliperEnd.x, caliperEnd.y, 4.5, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }, [
    state.activeSpecimen,
    state.objective,
    state.stageX,
    state.stageY,
    state.slideMounted,
    state.lightIntensity,
    state.irisAperture,
    state.isSickleCellMode,
    state.isPlasmolysisMode,
    showReticle,
    caliperStart,
    caliperEnd,
  ])

  useEffect(() => {
    drawSpecimen()
  }, [drawSpecimen])

  // Mouse handlers for Interactive Caliper
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!caliperActive) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCaliperStart({ x, y })
    setCaliperEnd({ x, y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!caliperActive || !caliperStart) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCaliperEnd({ x, y })

    // Calculate real physical distance in microns (µm)
    const dx = x - caliperStart.x
    const dy = y - caliperStart.y
    const pixelDist = Math.sqrt(dx * dx + dy * dy)
    const um = +(pixelDist * (optical.scaleBarUnitsPerPixel / (state.objective / 10))).toFixed(1)
    setMeasuredDistanceUm(um)
    onUpdateState({ caliperDistanceUm: um })
  }

  const handleMouseUp = () => {
    if (!caliperActive) return
    // Lock caliper
  }

  // Micrograph Snapshot Capture
  const handleCapture = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const caption = `${currentSpecimen.name} (${optical.magnification}x, Scale: ${optical.scaleBarLengthUm} µm)`
    onCaptureSnapshot?.(dataUrl, caption)
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#04060b',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-3)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        zIndex: isFullscreen ? 100 : 1,
      }}
    >
      {/* Viewport Top Bar */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-2)',
          padding: '0 var(--space-2)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
              fontWeight: 700,
            }}
          >
            {optical.magnification}x TOTAL MAGNIFICATION
          </span>
          <span>N.A. {optical.numericalAperture}</span>
          <span>Abbe Limit: {optical.resolutionLimitUm} µm</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className={`btn btn-sm ${showReticle ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowReticle(!showReticle)}
            style={{ fontSize: '10px', padding: '3px 8px' }}
            title="Toggle Ocular Micrometer Reticle"
          >
            <Ruler size={11} /> Reticle
          </button>
          <button
            className={`btn btn-sm ${caliperActive ? 'btn-danger' : 'btn-ghost'}`}
            onClick={() => {
              setCaliperActive(!caliperActive)
              if (caliperActive) {
                setCaliperStart(null)
                setCaliperEnd(null)
                setMeasuredDistanceUm(null)
              }
            }}
            style={{ fontSize: '10px', padding: '3px 8px' }}
            title="Interactive Click & Drag Measurement Caliper"
          >
            <Hash size={11} /> {caliperActive ? 'Cancel Caliper' : 'Measure Caliper'}
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleCapture}
            style={{ fontSize: '10px', padding: '3px 8px', color: '#a78bfa' }}
            title="Capture Micrograph for Lab Report"
          >
            <Camera size={11} /> Snapshot
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{ fontSize: '10px', padding: '3px 6px' }}
          >
            {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Main Micrograph Circular Canvas with Blur & Aberration filter */}
      <div
        style={{
          position: 'relative',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.9)',
          border: '3px solid #1e293b',
        }}
      >
        <canvas
          ref={canvasRef}
          width={560}
          height={560}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{
            display: 'block',
            cursor: caliperActive ? 'crosshair' : 'default',
            filter: `blur(${focusStatus.blurPx}px) brightness(${
              focusStatus.aberrationPenalty > 0 ? 1.35 : 1.0
            }) contrast(${focusStatus.aberrationPenalty > 0 ? 0.7 : 1.0})`,
            transition: 'filter 0.15s ease',
          }}
        />

        {/* Optical Focus Warning Overlay */}
        {!focusStatus.isSweetSpot && state.slideMounted && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 14px',
              fontSize: '11px',
              color: '#f87171',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
            }}
          >
            <AlertTriangle size={12} />
            Defocus: {focusStatus.blurPx.toFixed(1)} px. Adjust coarse/fine focus knobs.
          </div>
        )}

        {/* Immersion Oil Missing Warning at 100x */}
        {state.objective === 100 && !state.hasImmersionOil && state.slideMounted && (
          <div
            style={{
              position: 'absolute',
              top: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(180, 83, 9, 0.92)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #f59e0b',
              borderRadius: 'var(--radius-full)',
              padding: '5px 16px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
          >
            <Droplets size={13} />
            100x DRY WARNING: Refractive mismatch! Apply Immersion Oil to achieve 1.25 N.A.
          </div>
        )}

        {/* Perfect Focus Confirmation Badge */}
        {focusStatus.isSweetSpot && state.slideMounted && (
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(20, 83, 45, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid #22c55e',
              borderRadius: 'var(--radius-full)',
              padding: '4px 14px',
              fontSize: '11px',
              color: '#86efac',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
            }}
          >
            <CheckCircle2 size={12} />
            Diffraction-Limited Kohler Focal Plane
          </div>
        )}
      </div>

      {/* Viewport Calibrated Bottom HUD */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'var(--space-3)',
          padding: '0 var(--space-2)',
          fontSize: '11px',
        }}
      >
        {/* Calibrated Scale Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 60,
                height: 3,
                background: '#38bdf8',
                borderRadius: 2,
                marginBottom: 2,
              }}
            />
            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>
              {optical.scaleBarLengthUm} µm
            </span>
          </div>

          {measuredDistanceUm !== null && (
            <div
              style={{
                padding: '2px 8px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid #f43f5e',
                borderRadius: 'var(--radius-md)',
                color: '#fda4af',
                fontWeight: 700,
              }}
            >
              Measured Distance: {measuredDistanceUm} µm
            </div>
          )}
        </div>

        {/* Quick Pathology / Clinical Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {state.activeSpecimen === 'blood_smear' && (
            <button
              className={`btn btn-xs ${state.isSickleCellMode ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => onUpdateState({ isSickleCellMode: !state.isSickleCellMode })}
              style={{ fontSize: '10px' }}
            >
              {state.isSickleCellMode ? 'Sickle Cell Active' : 'Normal Blood Mode'}
            </button>
          )}

          {state.activeSpecimen === 'onion_epidermis' && (
            <button
              className={`btn btn-xs ${state.isPlasmolysisMode ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => onUpdateState({ isPlasmolysisMode: !state.isPlasmolysisMode })}
              style={{ fontSize: '10px' }}
            >
              {state.isPlasmolysisMode ? 'Plasmolysis (Hypertonic)' : 'Turgid State'}
            </button>
          )}

          {/* Quick Immersion Oil Dispenser Button */}
          {state.objective === 100 && (
            <button
              className={`btn btn-xs ${state.hasImmersionOil ? 'btn-ghost' : 'btn-primary'}`}
              onClick={() => onUpdateState({ hasImmersionOil: !state.hasImmersionOil })}
              style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Droplets size={11} />
              {state.hasImmersionOil ? 'Oil Applied (1.518 n)' : 'Apply Immersion Oil'}
            </button>
          )}
        </div>
      </div>

      {/* Hemocytometer / Cell Counter Dock */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-3)',
          background: 'rgba(15, 23, 42, 0.65)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          fontSize: '11px',
        }}
      >
        <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Hash size={12} color="#38bdf8" /> Hemocytometer Differential Tally Counter:
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {Object.entries(tallyCounts).map(([key, count]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => setTallyCounts((prev) => ({ ...prev, [key]: prev[key] + 1 }))}
                style={{ fontSize: '10px', padding: '2px 8px' }}
              >
                {key}: <strong>{count}</strong>
              </button>
            </div>
          ))}
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setTallyCounts({ Primary: 0, Secondary: 0, Abnormal: 0 })}
            title="Reset Counter"
            style={{ color: 'var(--text-muted)' }}
          >
            <RotateCcw size={10} />
          </button>
        </div>
      </div>
    </div>
  )
}
export default MicroscopeViewport
