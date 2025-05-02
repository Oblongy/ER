import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import RatioMaker from './pages/RatioMaker'
import Team from './pages/Team'
import Setups from './pages/Setups'
import BracketMaker from './pages/BracketMaker'
import Login from './pages/Login'
import Register from './pages/Register'
import { useTheme } from './context/ThemeContext'

const AppContent = () => {
  const { isRaceMode } = useTheme()
  const location = useLocation()

  return (
    <div className={`min-h-screen text-white transition-colors duration-300 ${
      isRaceMode ? 'bg-red-950' : 'bg-black'
    }`}>
      <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1633793675529-31b4fb6665be')] opacity-10 bg-cover bg-center pointer-events-none" />
      <div className={`fixed inset-0 bg-gradient-to-t pointer-events-none transition-colors duration-300 ${
        isRaceMode 
          ? 'from-red-950 via-transparent to-red-950/80' 
          : 'from-black via-transparent to-black'
      }`} />
      <div className="relative z-10">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/ratio-maker" element={<RatioMaker />} />
            <Route path="/team" element={<Team />} />
            <Route path="/setups" element={<Setups />} />
            <Route path="/bracket-maker" element={<BracketMaker />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App