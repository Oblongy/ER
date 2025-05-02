import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wrench, ChevronDown, ChevronUp, Settings, Download, Plus, X, AlertCircle } from 'lucide-react'
import { jsPDF } from 'jspdf/dist/jspdf.umd.min.js'
import CarSelector from '../components/CarSelector'
import Setup from '../components/Setup'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

interface Setup {
  id?: string
  name: string
  parts: Record<string, string>
  gearRatios: Record<string, number>
  shiftPoints: Record<string, number>
  nosPoints: Record<string, number>
  carId?: string | null
}

const defaultSetup: Setup = {
  name: 'New Setup',
  parts: {
    'Intake': '-3',
    'Throttle Body': '-3',
    'Supercharger': '-3',
    'Reinforcement': '-3',
    'Diverter Valves and BOV': '-3',
    'Nitrous Oxide': '-3',
    'Radiator': '-3',
    'Oil Catch System': '-3',
    'Catalytic Converter': '-3',
    'Exhaust Manifold': '-3',
    'ECU': '-3',
    'Weight Reduction': '-3',
    'Fuel System': '-3',
    'Brakes': '-3',
    'Differential': '-3',
    'Clutch': '-3',
    'Drivetrain': '-3',
    'Transmission': '-3',
    'Camshafts': '-3',
    'Intercooler': '-3',
    'Turbo': '-3',
    'Top End Kit': '-3'
  },
  gearRatios: {
    'Final Drive': 4.23,
    '1st Gear': 2.66,
    '2nd Gear': 2.06,
    '3rd Gear': 1.55,
    '4th Gear': 1.22,
    '5th Gear': 0.95,
    '6th Gear': 0.74
  },
  shiftPoints: {
    '1st': 7200,
    '2nd': 7200,
    '3rd': 7200,
    '4th': 7200,
    '5th': 7200,
    '6th': 7200
  },
  nosPoints: {
    '1st': 0,
    '2nd': 0,
    '3rd': 6500,
    '4th': 6800,
    '5th': 7000,
    '6th': 0
  }
}

const rx7Setup: Setup = {
  name: 'RX-7 Setup',
  parts: {
    'Intake': '-3',
    'Throttle Body': '-3',
    'Supercharger': '-3',
    'Reinforcement': '-3',
    'Diverter Valves and BOV': '-3',
    'Nitrous Oxide': '-3',
    'Radiator': '-3',
    'Oil Catch System': '-3',
    'Catalytic Converter': '-3',
    'Exhaust Manifold': '-3',
    'ECU': '-3',
    'Weight Reduction': '-3',
    'Fuel System': '-3',
    'Brakes': '-3',
    'Differential': '-3',
    'Clutch': '-3',
    'Drivetrain': '-3',
    'Transmission': '-3',
    'Gears': '-3',
    'Rotor': '-3',
    'Porting': '-3',
    'Eccentric Shaft Kits': '-3',
    'Intercooler': '-3',
    'Turbo': '-3',
    'Top End Kit': '-3'
  },
  gearRatios: defaultSetup.gearRatios,
  shiftPoints: defaultSetup.shiftPoints,
  nosPoints: defaultSetup.nosPoints
}

const downloadPDF = (setup: Setup) => {
  const doc = new jsPDF()
  
  // Add title
  doc.setFontSize(20)
  doc.text(setup.name, 20, 20)
  
  // Add parts list
  doc.setFontSize(16)
  doc.text('Parts List', 20, 40)
  let y = 50
  Object.entries(setup.parts).forEach(([part, value]) => {
    doc.setFontSize(12)
    doc.text(`${part}: ${value}`, 20, y)
    y += 7
  })
  
  // Add gear ratios
  y += 10
  doc.setFontSize(16)
  doc.text('Gear Ratios', 20, y)
  y += 10
  Object.entries(setup.gearRatios).forEach(([gear, ratio]) => {
    doc.setFontSize(12)
    doc.text(`${gear}: ${ratio}`, 20, y)
    y += 7
  })
  
  // Add shift points and NOS points
  y += 10
  doc.setFontSize(16)
  doc.text('Shift & NOS Points', 20, y)
  y += 10
  Object.entries(setup.shiftPoints).forEach(([gear, rpm]) => {
    const nosPoint = setup.nosPoints[gear]
    doc.setFontSize(12)
    doc.text(`${gear} Gear - Shift: ${rpm} RPM | NOS: ${nosPoint || 'OFF'}`, 20, y)
    y += 7
  })
  
  doc.save(`${setup.name.replace(/\s+/g, '_')}_setup.pdf`)
}

function Setups() {
  const [activeSetup, setActiveSetup] = useState<Setup>(defaultSetup)
  const [savedSetups, setSavedSetups] = useState<Setup[]>([])
  const [expandedSection, setExpandedSection] = useState<string | null>('parts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  
  const { user } = useAuth()

  useEffect(() => {
    fetchSetups()
  }, [user])

  const fetchSetups = async () => {
    if (!user) {
      setSavedSetups([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('setups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform data to match our local format
      const formattedSetups = data.map(setup => ({
        id: setup.id,
        name: setup.name,
        parts: setup.parts,
        gearRatios: setup.gear_ratios,
        shiftPoints: setup.shift_points,
        nosPoints: setup.nos_points,
        carId: setup.car_id
      }))
      
      setSavedSetups(formattedSetups)
      
      // Set active setup to the first one if available
      if (formattedSetups.length > 0) {
        setActiveSetup(formattedSetups[0])
      }
    } catch (err) {
      console.error('Error fetching setups:', err)
      setError('Failed to load setups')
    } finally {
      setLoading(false)
    }
  }

  const handleCarSelect = (carId: string, carName: string) => {
    if (carId === '1993-mazda-rx-7') {
      setActiveSetup({
        ...rx7Setup,
        name: `${carName} Setup`,
        carId
      })
    } else {
      setActiveSetup({
        ...defaultSetup,
        name: `${carName} Setup`,
        carId
      })
    }
    setIsCreatingNew(true)
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleSetupSave = (savedSetup: any) => {
    // Refresh the setups list
    fetchSetups()
    setIsCreatingNew(false)
  }

  const handleSetupDelete = (id: string) => {
    // Remove from saved setups
    setSavedSetups(savedSetups.filter(setup => setup.id !== id))
    
    // If the active setup was deleted, set to the first available or default
    if (activeSetup.id === id) {
      if (savedSetups.length > 1) {
        const newActiveSetup = savedSetups.find(setup => setup.id !== id)
        if (newActiveSetup) setActiveSetup(newActiveSetup)
      } else {
        setActiveSetup(defaultSetup)
      }
    }
  }

  const handleCreateNew = () => {
    setActiveSetup({
      ...defaultSetup,
      name: 'New Setup'
    })
    setIsCreatingNew(true)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="fixed inset-0 bg-[url('/images/tuner.png')] bg-cover bg-center opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black/30 to-black/90 pointer-events-none" />
      
      <div className="relative z-20 max-w-7xl mx-auto">
        <motion.div 
          className="flex items-center space-x-3 mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Wrench className="w-8 h-8 text-red-500" />
          <h1 className="text-4xl font-bold font-orbitron bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">Racing Setups</h1>
        </motion.div>

        {!user && (
          <motion.div
            className="mb-8 p-4 bg-red-900/30 border border-red-500/30 rounded-lg"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-white">Authentication Required</h3>
                <p className="text-gray-300 mt-1">
                  You need to <a href="/login" className="text-red-400 hover:text-red-300 underline">log in</a> or <a href="/register" className="text-red-400 hover:text-red-300 underline">register</a> to save your racing setups.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm p-6 rounded-lg border border-red-500/20 shadow-lg shadow-red-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <img src="/images/noob.png" alt="Setup" className="w-5 h-5" />
                  <h2 className="text-lg font-bold font-orbitron text-red-500">Saved Setups</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCreateNew}
                    className="p-2 rounded-full hover:bg-red-500/10 transition-all duration-300 hover:scale-110 group"
                  >
                    <Plus className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors duration-300" />
                  </button>
                  {activeSetup && (
                    <button
                      onClick={() => downloadPDF(activeSetup)}
                      className="p-2 rounded-full hover:bg-red-500/10 transition-all duration-300 hover:scale-110 group"
                    >
                      <Download className="w-5 h-5 text-red-500 group-hover:text-red-400 transition-colors duration-300" />
                    </button>
                  )}
                </div>
              </div>
              
              {loading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
                </div>
              ) : (
                <>
                  {savedSetups.length === 0 && !isCreatingNew ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>No saved setups found.</p>
                      <button 
                        onClick={handleCreateNew}
                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                      >
                        Create New Setup
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {savedSetups.map(setup => (
                        <div 
                          key={setup.id} 
                          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            activeSetup.id === setup.id ? 'bg-red-500/20 border border-red-500/40' : 'bg-gray-800/30 border border-transparent hover:border-red-500/20'
                          }`}
                          onClick={() => {
                            setActiveSetup(setup)
                            setIsCreatingNew(false)
                          }}
                        >
                          <h3 className="font-medium">{setup.name}</h3>
                        </div>
                      ))}
                      
                      {isCreatingNew && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40">
                          <h3 className="font-medium">{activeSetup.name} (Unsaved)</h3>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Select Vehicle</h3>
                <CarSelector onCarSelect={handleCarSelect} />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {activeSetup && (
              <Setup
                {...activeSetup}
                onSave={handleSetupSave}
                onDelete={handleSetupDelete}
                isEditing={isCreatingNew}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Setups