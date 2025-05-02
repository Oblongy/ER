import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Car } from 'lucide-react'

interface CarSelectorProps {
  onCarSelect: (carId: string, carName: string) => void
}

interface CarBrand {
  name: string
  models: {
    year: number
    name: string
  }[]
}

const carBrands: CarBrand[] = [
  {
    name: 'Ford',
    models: [
      { year: 1997, name: 'Ford Probe GT' }
    ]
  },
  {
    name: 'Mitsubishi',
    models: [
      { year: 1999, name: 'Mitsubishi 3000GT SL' },
      { year: 1999, name: 'Mitsubishi Eclipse GSX' },
      { year: 1999, name: 'Mitsubishi 3000GT VR-4' },
      { year: 2005, name: 'Mitsubishi Lancer Evolution VIII' }
    ]
  },
  {
    name: 'Acura',
    models: [
      { year: 1997, name: 'Acura Integra Type-R' },
      { year: 1997, name: 'Acura Integra GSR' },
      { year: 1999, name: 'Acura NSX' }
    ]
  },
  {
    name: 'Subaru',
    models: [
      { year: 1998, name: 'Subaru WRX STI 22B' },
      { year: 2002, name: 'Subaru WRX' },
      { year: 2002, name: 'Subaru WRX STI' },
      { year: 2002, name: 'Subaru WRX STI RWD' },
      { year: 2005, name: 'Subaru WRX' },
      { year: 2005, name: 'Subaru WRX STI' }
    ]
  },
  {
    name: 'Dodge',
    models: [
      { year: 2005, name: 'Dodge Neon SRT-4' }
    ]
  },
  {
    name: 'Honda',
    models: [
      { year: 1997, name: 'Honda Civic Type-R' },
      { year: 1997, name: 'Honda Civic DX' }
    ]
  },
  {
    name: 'Mazda',
    models: [
      { year: 1993, name: 'Mazda RX-7' }
    ]
  },
  {
    name: 'Chevrolet',
    models: [
      { year: 2004, name: 'Chevrolet Corvette Z06' }
    ]
  }
]

export default function CarSelector({ onCarSelect }: CarSelectorProps) {
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)
  const [selectedCar, setSelectedCar] = useState<string | null>(null)

  const onSelectCar = (year: number, name: string) => {
    const carId = `${year}-${name.replace(/\s+/g, '-').toLowerCase()}`
    setSelectedCar(`${year} ${name}`)
    onCarSelect(carId, `${year} ${name}`)
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm rounded-lg border border-red-500/20 overflow-hidden shadow-lg shadow-red-500/5">
      {carBrands.map((brand) => (
        <div key={brand.name} className="border-b border-red-500/10 last:border-b-0">
          <button
            onClick={() => setExpandedBrand(expandedBrand === brand.name ? null : brand.name)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-red-500/10 transition-all duration-300 group"
          >
            <div className="flex items-center space-x-3">
              <Car className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold text-lg font-orbitron group-hover:text-red-500 transition-colors duration-300">{brand.name}</span>
            </div>
            {expandedBrand === brand.name ? (
              <ChevronUp className="w-5 h-5 text-red-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-red-500" />
            )}
          </button>
          
          {expandedBrand === brand.name && (
            <div className="bg-black/20 divide-y divide-red-500/5">
              {brand.models.map((model) => (
                <button
                  key={`${model.year}-${model.name}`}
                  onClick={() => onSelectCar(model.year, model.name)}
                  className={`w-full px-6 py-3 text-left hover:bg-red-500/10 transition-all duration-300 flex items-center justify-between group ${
                    selectedCar === `${model.year} ${model.name}` 
                      ? 'bg-red-500/20 text-white font-medium' 
                      : 'text-gray-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="text-red-500 font-mono">{model.year}</span>
                    <span className="group-hover:text-white transition-colors duration-300">{model.name}</span>
                  </span>
                  {selectedCar === `${model.year} ${model.name}` && (
                    <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">Selected</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}