// App.tsx
// Main routing, hash-based URL synchronization, and layout component

import { useState, useEffect } from 'react'
import { useStore } from './store'
import { getModuleById } from './data/curriculum'
import Nav from './components/Nav'
import ToastContainer from './components/Toast'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import ModuleDetails from './pages/ModuleDetails'
import SimulationViewer from './components/SimulationViewer'

export default function App() {
  const { activePage, setActivePage, activeSession, startSession } = useStore()
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null)

  // Listen to hash changes for deep linking
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (!hash) return
      if (hash.startsWith('module=')) {
        const id = hash.replace('module=', '')
        setActiveModuleId(id)
        setActivePage('module')
      } else if (hash.startsWith('sim=')) {
        const id = hash.replace('sim=', '')
        const mod = getModuleById(id)
        if (mod) startSession(mod)
      } else if (['dashboard', 'explore', 'my-learning', 'leaderboard'].includes(hash)) {
        setActivePage(hash)
      }
    }

    parseHash()
    window.addEventListener('hashchange', parseHash)
    return () => window.removeEventListener('hashchange', parseHash)
  }, [setActivePage, startSession])

  // Router override
  const handleNavigate = (page: string, moduleId?: string) => {
    if (moduleId) {
      setActiveModuleId(moduleId)
      window.location.hash = `module=${moduleId}`
    } else {
      window.location.hash = page
    }
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStartSimulation = () => {
    if (activeModuleId) {
      const mod = getModuleById(activeModuleId)
      if (mod) {
        window.location.hash = `sim=${activeModuleId}`
        startSession(mod)
      }
    }
  }

  return (
    <>
      {/* Simulation overlay takes over the entire screen when active */}
      {activeSession ? (
        <SimulationViewer
          onClose={() => {
            window.location.hash = 'dashboard'
            setActivePage('dashboard')
          }}
        />
      ) : (
        <>
          <Nav onNavigate={handleNavigate} />

          <main>
            {activePage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
            {activePage === 'explore' && <Explore onNavigate={handleNavigate} />}
            {activePage === 'my-learning' && <Dashboard onNavigate={handleNavigate} />} {/* Demo redirect */}
            {activePage === 'leaderboard' && <Dashboard onNavigate={handleNavigate} />} {/* Demo redirect */}
            {activePage === 'module' && activeModuleId && (
              <ModuleDetails
                moduleId={activeModuleId}
                onNavigate={handleNavigate}
                onStartSimulation={handleStartSimulation}
              />
            )}
          </main>
        </>
      )}

      {/* Global Notifications */}
      <ToastContainer />
    </>
  )
}
