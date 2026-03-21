import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Timer from './pages/Timer'
import Pomodoro from './pages/Pomodoro'
import Sintesi from './pages/Sintesi'
import Interrogazione from './pages/Interrogazione'
import Sessioni from './pages/Sessioni'
import Admin from './pages/Admin'
import Layout from './components/Layout'
import API from './services/api'

export default function App() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('user_email')
    if (token && email) {
      setUser({ email })
      checkAdmin()
    }
  }, [])

  const checkAdmin = async () => {
    try {
      await API.get('/sessions/admin/all')
      setIsAdmin(true)
    } catch(e) {
      setIsAdmin(false)
    }
  }

  const handleLogin = async (data) => {
    setUser(data)
    try {
      await API.get('/sessions/admin/all')
      setIsAdmin(true)
    } catch(e) {
      setIsAdmin(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    setUser(null)
    setIsAdmin(false)
  }

  if (!user) return <Login onLogin={handleLogin} />

  return (
    <BrowserRouter>
      <Layout onLogout={handleLogout} user={user} isAdmin={isAdmin}>
        <Routes>
          <Route path="/" element={<Timer />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/sintesi" element={<Sintesi />} />
          <Route path="/interrogazione" element={<Interrogazione />} />
          <Route path="/sessioni" element={<Sessioni />} />
          {isAdmin && <Route path="/admin" element={<Admin />} />}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
