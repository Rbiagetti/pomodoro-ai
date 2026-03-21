import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Timer from './pages/Timer'
import Pomodoro from './pages/Pomodoro'
import Sintesi from './pages/Sintesi'
import Interrogazione from './pages/Interrogazione'
import Sessioni from './pages/Sessioni'
import Layout from './components/Layout'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('user_email')
    if (token && email) setUser({ email })
  }, [])

  const handleLogin = (data) => setUser(data)
  const handleLogout = () => { localStorage.clear(); setUser(null) }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout} user={user}>
        <Routes>
          <Route path="/" element={<Timer />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/sintesi" element={<Sintesi />} />
          <Route path="/interrogazione" element={<Interrogazione />} />
          <Route path="/sessioni" element={<Sessioni />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
