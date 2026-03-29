import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import OnboardingModal from './components/OnboardingModal'
import Timer from './pages/Timer'
import Pomodoro from './pages/Pomodoro'
import Sintesi from './pages/Sintesi'
import Interrogazione from './pages/Interrogazione'
import Sessioni from './pages/Sessioni'
import Error from './pages/Error'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('user_email')
    if (token && email) setUser({ email })
  }, [])

  const [showOnboarding, setShowOnboarding] = useState(false)

  const handleGuestLogin = () => {
    setIsGuest(true)
    setUser({ email: 'ospite', guest: true })
  }

  const handleLogin = (data) => {
    setIsGuest(false)
    setUser(data)
    if (!localStorage.getItem('pomodoro_onboarded')) {
      setShowOnboarding(true)
    }
  }
  const handleLogout = () => { localStorage.clear(); sessionStorage.clear(); setUser(null); setIsGuest(false) }

  return (
    <>
      <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={
            !user
              ? <Login onLogin={handleLogin} onGuestLogin={handleGuestLogin} />
              : <Layout onLogout={handleLogout} user={user} isGuest={isGuest}>
                  <Routes>
                    <Route path="/" element={<Timer />} />
                    <Route path="/pomodoro" element={<Pomodoro />} />
                    <Route path="/sintesi" element={<Sintesi />} />
                    <Route path="/interrogazione" element={<Interrogazione isGuest={isGuest} />} />
                    <Route path="/sessioni" element={<Sessioni />} />
                    <Route path="*" element={<Error message="Pagina non trovata 🍅" />} />
                  </Routes>
                </Layout>
          } />
        </Routes>
      </ErrorBoundary>
      </BrowserRouter>
    {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
    </>
  )
}
