import React from 'react'
import { Calculator, Timer, Gauge, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface RatioInput {
  finalDrive: number
  firstGear: number
  gearRatios: number[]
  horsepower: number,
  gearCount: 5 | 6
}

export default function RatioMaker() {
  const [inputs, setInputs] = React.useState<RatioInput>({
    finalDrive: 3.73,
    firstGear: 2.66,
    gearRatios: [2.66, 1.78, 1.30, 1.00, 0.74, 0.50],
    horsepower: 800,
    gearCount: 6
  })
  const [showResults, setShowResults] = React.useState(false)
  const [selectedGear, setSelectedGear] = React.useState<number | null>(null)

  const calculateSpeed = (rpm: number, gearRatio: number): number => {
    // Assuming 26-inch tire diameter
    const tireCircumference = 26 * Math.PI / 12 // in feet
    const speedMph = (rpm * tireCircumference * 60) / (finalDrive * gearRatio * 5280)
    return Math.round(speedMph * 100) / 100
  }

  const calculateAcceleration = (speed: number, hp: number): number => {
    // Simplified acceleration calculation
    const force = (hp * 5252) / speed // Torque at wheel
    const acceleration = force / 3200 // Using standard weight
    return acceleration * 0.0455 // Convert to rough 0-60 time
  }

  const { finalDrive, firstGear, gearRatios, horsepower } = inputs
  const shiftRpm = 6500 // Optimal shift point

  // Fixed multipliers to ensure proper progression
  const ratioMultipliers = {
    5: [1, 0.72, 0.52, 0.40, 0.30],
    6: [1, 0.67, 0.49, 0.38, 0.28, 0.19]
  }

  const handleGenerate = () => {
    const multipliers = ratioMultipliers[inputs.gearCount]
    const newRatios = multipliers.map(m => Math.round(firstGear * m * 100) / 100)
    
    // Ensure we have exactly the right number of ratios based on gear count
    const finalRatios = [...newRatios];
    while (finalRatios.length > inputs.gearCount) {
      finalRatios.pop();
    }
    
    setInputs(prev => ({ ...prev, gearRatios: finalRatios }))
    setShowResults(true)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="fixed inset-0 bg-[url('/src/BK.jpg')] bg-cover bg-center opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black/30 to-black/90 pointer-events-none" />
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="relative z-20 flex items-center space-x-3 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Calculator className="w-8 h-8 text-red-500" />
          <h1 className="text-4xl font-bold">Ratio Calculator</h1>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div 
            className="relative z-20 bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm p-6 rounded-lg border border-red-500/20"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-6">Input Parameters</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setInputs(prev => ({ ...prev, gearCount: 5 }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-200 ${
                    inputs.gearCount === 5 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  5-Speed
                </button>
                <button
                  onClick={() => setInputs(prev => ({ ...prev, gearCount: 6 }))}
                  className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all duration-200 ${
                    inputs.gearCount === 6 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  6-Speed
                </button>
              </div>

              <InputSlider
                label="Final Drive Ratio"
                value={finalDrive}
                min={2.0}
                max={6.0}
                step={0.01}
                onChange={(value) => setInputs(prev => ({ ...prev, finalDrive: value }))}
              />
              
              <InputSlider
                label="First Gear Ratio"
                value={firstGear}
                min={0.48}
                max={6.0}
                step={0.01}
                onChange={(value) => setInputs(prev => ({ ...prev, firstGear: value }))}
              />
              
              <InputSlider
                label="Horsepower"
                value={horsepower}
                min={200}
                max={1400}
                step={10}
                onChange={(value) => setInputs(prev => ({ ...prev, horsepower: value }))}
              />
              
              <button
                onClick={handleGenerate}
                className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              >
                <Zap className="w-5 h-5" />
                <span>Generate Ratios</span>
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            className={`relative z-20 bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm p-6 rounded-lg border border-red-500/20 transition-opacity duration-300 ${showResults ? 'opacity-100' : 'opacity-50'}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center space-x-2 mb-6">
              <Timer className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold">Drag Performance</h2>
            </div>
            
            <div className={`space-y-6 ${!showResults && 'pointer-events-none'}`}>
              <div className="grid grid-cols-2 gap-4">
                {gearRatios.slice(0, inputs.gearCount).map((ratio, index) => {
                  const shiftSpeed = calculateSpeed(shiftRpm, ratio)
                  const nextRatio = gearRatios[index + 1]
                  const dropRpm = nextRatio ? (shiftSpeed / calculateSpeed(1000, nextRatio)) * 1000 : 0
                  const efficiency = dropRpm > 0 ? Math.max(0, 100 - (dropRpm / 100)) : 100
                  const efficiencyColor = efficiency > 80 ? 'green' : efficiency > 60 ? 'yellow' : 'red'
                  
                  return (
                    <motion.div
                      key={index}
                      className={`bg-gradient-to-br from-gray-800/30 to-gray-900/30 p-6 rounded-3xl border border-red-500/20 backdrop-blur-md shadow-lg hover:shadow-red-500/10 cursor-pointer transition-all duration-300 ${
                        selectedGear === index ? 'scale-105 border-red-500/50' : 'hover:scale-102'
                      }`}
                      onClick={() => setSelectedGear(selectedGear === index ? null : index)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-bold font-orbitron">Gear {index + 1}</div>
                        <div className="text-2xl font-mono text-red-500">{ratio}:1</div>
                      </div>
                      <div className="space-y-3">
                        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`absolute left-0 top-0 h-full bg-${efficiencyColor}-500 transition-all duration-300`}
                            style={{ width: `${efficiency}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Shift Speed</span>
                          <span className="text-xl font-mono">{Math.round(shiftSpeed)} MPH</span>
                        </div>
                        {nextRatio && index < inputs.gearCount - 1 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">RPM Drop</span>
                            <span className="text-lg font-mono">{Math.round(dropRpm)} RPM</span>
                          </div>
                        )}
                      </div>
                      {selectedGear === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-red-500/10"
                        >
                          <div className="text-sm text-gray-400">
                            Efficiency: {Math.round(efficiency)}%
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-red-500/10">
                <div className="text-sm font-bold mb-2">Performance Estimates</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">0-60 MPH</span>
                    <span className="text-xl font-mono text-red-500">
                      {(calculateAcceleration(60, horsepower)).toFixed(1)}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">1/4 Mile Speed</span>
                    <span className="text-xl font-mono text-red-500">
                      {Math.round(calculateSpeed(shiftRpm, gearRatios[2]))} MPH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Power/Weight</span>
                    <span className="text-xl font-mono text-red-500">
                      {(horsepower / 3200 * 1000).toFixed(1)} hp/lb
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

interface InputSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function InputSlider({ label, value, min, max, step, onChange }: InputSliderProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-gray-300">{label}</label>
        <span className="text-red-500 font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500 [&::-webkit-slider-thumb]:hover:bg-red-400 [&::-webkit-slider-thumb]:transition-colors"
      />
    </div>
  )
}