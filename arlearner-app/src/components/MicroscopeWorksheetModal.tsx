// MicroscopeWorksheetModal - Institutional University Practicum Assessment,
// Clinical Pathology Case Examination, Gradebook Rubric & Exportable Lab Report

import React, { useState } from 'react'
import {
  type MicroscopeState,
  SPECIMEN_CATALOG,
  getOpticalParameters,
} from '../engine/MicroscopeEngine'
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Printer,
  FileSpreadsheet,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react'

interface SnapshotItem {
  id: string
  dataUrl: string
  caption: string
  timestamp: string
}

interface MicroscopeWorksheetModalProps {
  state: MicroscopeState
  snapshots: SnapshotItem[]
  onClose: () => void
  onGradeAwarded?: (grade: string, score: number) => void
}

export const MicroscopeWorksheetModal: React.FC<MicroscopeWorksheetModalProps> = ({
  state,
  snapshots,
  onClose,
  onGradeAwarded,
}) => {
  const currentSpecimen = SPECIMEN_CATALOG[state.activeSpecimen]
  const optical = getOpticalParameters(state.objective, state.hasImmersionOil, state.irisAperture)

  // Form inputs
  const [studentName, setStudentName] = useState('Biology Scholar')
  const [studentId, setStudentId] = useState('MED-2026-8841')
  const [q1OilPhysics, setQ1OilPhysics] = useState('')
  const [q2MeasuredSize, setQ2MeasuredSize] = useState(
    state.caliperDistanceUm !== null ? state.caliperDistanceUm.toString() : ''
  )
  const [q3StainingPrinciple, setQ3StainingPrinciple] = useState('')
  const [q4ClinicalDiagnosis, setQ4ClinicalDiagnosis] = useState('')

  // Graded State
  const [gradedResult, setGradedResult] = useState<{
    score: number
    letterGrade: string
    isPass: boolean
    feedback: string[]
  } | null>(null)

  const handleGrade = () => {
    let score = 0
    const feedback: string[] = []

    // 1. Evaluate Immersion Oil Physics
    if (q1OilPhysics === 'refractive_index') {
      score += 25
      feedback.push('Q1: Correct! Immersion oil matches the glass refractive index (n=1.518), eliminating light refraction and achieving NA 1.25.')
    } else {
      feedback.push('Q1: Incorrect. Immersion oil acts by matching the refractive index of glass coverslips (n=1.515), preventing light refraction at the air gap.')
    }

    // 2. Evaluate Caliper Micrometry
    const size = parseFloat(q2MeasuredSize) || 0
    if (state.activeSpecimen === 'blood_smear' && size >= 6.5 && size <= 8.5) {
      score += 25
      feedback.push(`Q2: Excellent micrometry! Measured erythrocyte diameter ${size} µm conforms precisely to physiological reference (7.2–7.8 µm).`)
    } else if (state.activeSpecimen === 'onion_epidermis' && size >= 150 && size <= 380) {
      score += 25
      feedback.push(`Q2: Accurate plant micrometry! Measured Allium cell length ${size} µm is within typical range (200–350 µm).`)
    } else if (size > 0) {
      score += 15
      feedback.push(`Q2: Acceptable measurement (${size} µm), though slightly deviated from textbook standard calibration.`)
    } else {
      feedback.push('Q2: Measurement incomplete. Use the ocular micrometer caliper tool to measure cellular diameter.')
    }

    // 3. Staining Chemistry
    if (q3StainingPrinciple.length > 5) {
      score += 25
      feedback.push('Q3: Strong comprehension of differential dye affinities and molecular target binding.')
    } else {
      score += 10
      feedback.push('Q3: Brief answer. Review cationic (basic) vs anionic (acidic) dye affinities.')
    }

    // 4. Clinical Pathology Case
    if (q4ClinicalDiagnosis.length > 5) {
      score += 25
      feedback.push('Q4: Accurate differential diagnosis correlating cytological morphology with clinical pathology.')
    } else {
      score += 10
      feedback.push('Q4: Clinical case requires deeper correlation with cellular abnormalities.')
    }

    let letterGrade = 'F'
    if (score >= 90) letterGrade = 'Grade A* (Distinction)'
    else if (score >= 80) letterGrade = 'Grade A (Honors)'
    else if (score >= 70) letterGrade = 'Grade B (Pass)'
    else if (score >= 60) letterGrade = 'Grade C (Pass)'

    const result = {
      score,
      letterGrade,
      isPass: score >= 60,
      feedback,
    }

    setGradedResult(result)
    onGradeAwarded?.(letterGrade, score)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 8, 15, 0.94)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '92vh',
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                University Histology & Microscopy Practicum Report
              </h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Accredited Laboratory Practicum Assessment & Analytical Gradebook
              </p>
            </div>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '6px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Student Metadata Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--space-3)',
            padding: 'var(--space-3)',
            background: 'var(--bg-surface-2)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>STUDENT CANDIDATE</label>
            <input
              type="text"
              className="input input-sm"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>INSTITUTIONAL ID</label>
            <input
              type="text"
              className="input input-sm"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{ width: '100%', fontSize: '12px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: 2 }}>PRACTICUM SPECIMEN</label>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginTop: 6 }}>
              {currentSpecimen.name} ({optical.magnification}x)
            </div>
          </div>
        </div>

        {/* Section 1: Optical Physics Assessment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} color="#38bdf8" /> 1. Optical Physics & Oil Immersion Mechanics
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Why does a 100x objective lens require immersion oil (n = 1.518) to resolve specimen details?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              {
                id: 'magnify_more',
                label: 'A) Immersion oil increases the focal length of the objective lens to provide higher digital zoom.',
              },
              {
                id: 'refractive_index',
                label: 'B) Immersion oil matches the refractive index of glass (n=1.515), preventing light refraction at the air gap and enabling maximum Numerical Aperture (1.25 N.A.).',
              },
              {
                id: 'cool_lens',
                label: 'C) The oil prevents thermal heating of the glass specimen from high-intensity halogen illumination.',
              },
            ].map((opt) => (
              <label
                key={opt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  background: q1OilPhysics === opt.id ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-surface-2)',
                  border: q1OilPhysics === opt.id ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                }}
              >
                <input
                  type="radio"
                  name="q1"
                  checked={q1OilPhysics === opt.id}
                  onChange={() => setQ1OilPhysics(opt.id)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Quantitative Micrometry Caliper Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} color="#38bdf8" /> 2. Quantitative Micrometry Caliper Measurement
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Enter your measured cellular diameter in microns (µm) recorded using the ocular reticle caliper:
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <input
              type="number"
              step="0.1"
              className="input input-sm"
              placeholder="e.g. 7.5"
              value={q2MeasuredSize}
              onChange={(e) => setQ2MeasuredSize(e.target.value)}
              style={{ maxWidth: 140, fontSize: '13px' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              µm (Micrometers) | Reference Range for {currentSpecimen.name}: {currentSpecimen.typicalSizeUm}
            </span>
          </div>
        </div>

        {/* Section 3: Diagnostic Cytology & Clinical Case */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            3. Histopathological Diagnosis & Staining Mechanism
          </h4>
          <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Describe the differential staining mechanism of {currentSpecimen.stainType} ({currentSpecimen.stainDescription}):
          </label>
          <textarea
            className="input input-sm"
            rows={2}
            placeholder="Explain molecular affinities (e.g. acidic eosin binding basic hemoglobin, or Gram peptidoglycan trapping)..."
            value={q3StainingPrinciple}
            onChange={(e) => setQ3StainingPrinciple(e.target.value)}
            style={{ width: '100%', fontSize: '11px', height: 48 }}
          />

          <label style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }}>
            Clinical Pathology Correlation ({currentSpecimen.clinicalRelevance}):
          </label>
          <textarea
            className="input input-sm"
            rows={2}
            placeholder="Discuss clinical significance, pathological morphology, or differential diagnosis..."
            value={q4ClinicalDiagnosis}
            onChange={(e) => setQ4ClinicalDiagnosis(e.target.value)}
            style={{ width: '100%', fontSize: '11px', height: 48 }}
          />
        </div>

        {/* Attached Captured Micrographs Gallery */}
        {snapshots.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h5 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Attached Micrograph Snapshots ({snapshots.length})
            </h5>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: 4 }}>
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  style={{
                    flexShrink: 0,
                    width: 120,
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-subtle)',
                    background: '#06080e',
                  }}
                >
                  <img src={snap.dataUrl} alt={snap.caption} style={{ width: '100%', height: 75, objectFit: 'cover' }} />
                  <div style={{ padding: '3px 6px', fontSize: '9px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {snap.caption}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Graded Evaluation Card */}
        {gradedResult && (
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              background: gradedResult.isPass ? 'rgba(20, 83, 45, 0.25)' : 'rgba(127, 29, 29, 0.25)',
              border: `1px solid ${gradedResult.isPass ? '#22c55e' : '#ef4444'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {gradedResult.isPass ? <CheckCircle2 size={20} color="#22c55e" /> : <AlertCircle size={20} color="#ef4444" />}
                <span style={{ fontSize: 'var(--text-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {gradedResult.letterGrade} ({gradedResult.score}%)
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Official Practicum Verified
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 4 }}>
              {gradedResult.feedback.map((item, idx) => (
                <div key={idx} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  • {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: '12px' }}>
            Back to Microscope
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {gradedResult && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handlePrint}
                style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={13} /> Print Official Lab Certificate
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={handleGrade}
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Sparkles size={13} /> Grade & Submit Practicum
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default MicroscopeWorksheetModal
