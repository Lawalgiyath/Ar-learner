// App.tsx
// Main routing and layout component

import { useState } from 'react'
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

  // Router override
  const handleNavigate = (page: string, moduleId?: string) => {
    if (moduleId) setActiveModuleId(moduleId)
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStartSimulation = () => {
    if (activeModuleId) {
      const mod = getModuleById(activeModuleId)
      if (mod) startSession(mod)
    }
  }

  // Render logic
  return (
    <>
      {/* Simulation overlay takes over the entire screen when active */}
      {activeSession ? (
        <SimulationViewer onClose={() => setActivePage('dashboard')} />
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
