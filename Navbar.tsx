import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Moon, Sun, Settings, Menu, X, LogIn, LogOut, UserPlus } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { isRaceMode, toggleRaceMode } = useTheme()
  const { user, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className={`${
      isRaceMode ? 'bg-red-950/80' : 'bg-black/50'
    } backdrop-blur-md border-b border-red-500/20 transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/sponsor3.png" alt="Envious Racing" className="h-8 w-auto" />
          </Link>
          <div className="hidden md:flex items-center space-x-2">
            <NavLink 
              to="/" 
              icon={<img src="/images/home.png" alt="Home" className="w-5 h-5" />} 
              text="Home" 
            />
            <NavLink 
              to="/ratio-maker" 
              icon={<img src="/images/ratio.png" alt="Ratio Maker" className="w-5 h-5" />} 
              text="Ratio Maker" 
            />
            <NavLink 
              to="/setups" 
              icon={<Settings className="w-5 h-5" />} 
              text="Setups" 
            />
            <NavLink 
              to="/team" 
              icon={<img src="/images/team.png" alt="Team" className="w-5 h-5" />} 
              text="Team" 
            />
            <NavLink 
              to="/bracket-maker" 
              icon={<img src="/images/bkmaker.png" alt="Bracket Maker" className="w-5 h-5" />} 
              text="Bracket Maker" 
            />
            {!user ? (
              <>
                <NavLink 
                  to="/login" 
                  icon={<LogIn className="w-5 h-5" />} 
                  text="Login" 
                />
                <NavLink 
                  to="/register" 
                  icon={<UserPlus className="w-5 h-5" />} 
                  text="Register" 
                />
              </>
            ) : (
              <button
                onClick={handleSignOut}
                className="group flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            )}
            <button
              onClick={toggleRaceMode}
              className="p-2 rounded-full hover:bg-red-500/10 transition-all duration-300 hover:scale-110"
            >
              {isRaceMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-full hover:bg-red-500/10 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-red-500" />
              ) : (
                <Menu className="w-6 h-6 text-red-500" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}>
          <div className="py-2 space-y-1">
            <MobileNavLink 
              to="/" 
              icon={<img src="/images/home.png" alt="Home" className="w-5 h-5" />} 
              text="Home"
              onClick={() => setIsMenuOpen(false)}
            />
            <MobileNavLink 
              to="/ratio-maker" 
              icon={<img src="/images/ratio.png" alt="Ratio Maker" className="w-5 h-5" />} 
              text="Ratio Maker"
              onClick={() => setIsMenuOpen(false)}
            />
            <MobileNavLink 
              to="/setups" 
              icon={<Settings className="w-5 h-5" />} 
              text="Setups"
              onClick={() => setIsMenuOpen(false)}
            />
            <MobileNavLink 
              to="/team" 
              icon={<img src="/images/team.png" alt="Team" className="w-5 h-5" />} 
              text="Team"
              onClick={() => setIsMenuOpen(false)}
            />
            <MobileNavLink 
              to="/bracket-maker" 
              icon={<img src="/images/bkmaker.png" alt="Bracket Maker" className="w-5 h-5" />} 
              text="Bracket Maker"
              onClick={() => setIsMenuOpen(false)}
            />
            {!user ? (
              <>
                <MobileNavLink 
                  to="/login" 
                  icon={<LogIn className="w-5 h-5" />} 
                  text="Login"
                  onClick={() => setIsMenuOpen(false)}
                />
                <MobileNavLink 
                  to="/register" 
                  icon={<UserPlus className="w-5 h-5" />} 
                  text="Register"
                  onClick={() => setIsMenuOpen(false)}
                />
              </>
            ) : (
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-red-500/10 hover:text-white transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

const MobileNavLink = ({ to, icon, text, onClick }: { to: string; icon: React.ReactNode; text: string; onClick: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-red-500/10 hover:text-white transition-all duration-300"
  >
    {icon}
    <span className="font-medium">{text}</span>
  </Link>
)

const NavLink = ({ to, icon, text }: { to: string; icon: React.ReactNode; text: string }) => (
  <Link
    to={to}
    className="group flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/10 hover:text-white transition-all duration-300 hover:scale-105"
  >
    {icon}
    <span>{text}</span>
  </Link>
)

export default Navbar