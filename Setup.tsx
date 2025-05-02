import React, { useState } from 'react'
import { Settings, Car, Save, Edit, Trash2 } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

interface SetupProps {
  id?: string
  name: string
  parts: Record<string, string>
  gearRatios: Record<string, number>
  shiftPoints: Record<string, number>
  nosPoints: Record<string, number>
  carId?: string | null
  onSave?: (setup: any) => void
  onDelete?: (id: string) => void
  isEditing?: boolean
}

export default function Setup({
  id,
  name,
  parts,
  gearRatios,
  shiftPoints,
  nosPoints,
  carId,
  onSave,
  onDelete,
  isEditing = false
}: SetupProps) {
  const [setupName, setSetupName] = useState(name)
  const [editing, setEditing] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()

  const handleSave = async () => {
    if (!user) {
      setError('You must be logged in to save setups')
      return
    }
    
    setSaving(true)
    setError(null)
    
    try {
      const setupData = {
        name: setupName,
        parts,
        gear_ratios: gearRatios,
        shift_points: shiftPoints,
        nos_points: nosPoints,
        car_id: carId,
        user_id: user.id
      }
      
      let result
      
      if (id) {
        // Update existing setup
        const { data, error } = await supabase
          .from('setups')
          .update(setupData)
          .eq('id', id)
          .select()
        
        if (error) throw error
        result = data?.[0]
      } else {
        // Create new setup
        const { data, error } = await supabase
          .from('setups')
          .insert(setupData)
          .select()
        
        if (error) throw error
        result = data?.[0]
      }
      
      setEditing(false)
      if (onSave) onSave(result)
    } catch (err) {
      console.error('Error saving setup:', err)
      setError('Failed to save setup')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !onDelete) return
    
    if (confirm('Are you sure you want to delete this setup?')) {
      try {
        const { error } = await supabase
          .from('setups')
          .delete()
          .eq('id', id)
        
        if (error) throw error
        
        onDelete(id)
      } catch (err) {
        console.error('Error deleting setup:', err)
        setError('Failed to delete setup')
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm p-6 rounded-lg border border-red-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {editing ? (
            <input
              type="text"
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              className="bg-gray-800/50 border border-red-500/20 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500/40"
              placeholder="Setup Name"
            />
          ) : (
            <h3 className="text-xl font-bold">{setupName}</h3>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
            >
              <Edit className="w-5 h-5 text-red-500" />
            </button>
          )}
          
          {editing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className={`p-2 rounded-full hover:bg-red-500/10 transition-colors ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Save className="w-5 h-5 text-red-500" />
            </button>
          )}
          
          {id && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-100 rounded-lg border border-red-500/30 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-lg font-semibold mb-2">Parts</h4>
          <div className="bg-gray-800/30 p-3 rounded-lg max-h-60 overflow-y-auto">
            {Object.entries(parts).map(([part, value]) => (
              <div key={part} className="flex justify-between items-center py-1 border-b border-red-500/10 last:border-0">
                <span className="text-gray-300">{part}</span>
                <span className="text-red-500 font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-2">Gear Ratios</h4>
          <div className="bg-gray-800/30 p-3 rounded-lg max-h-60 overflow-y-auto">
            {Object.entries(gearRatios).map(([gear, ratio]) => (
              <div key={gear} className="flex justify-between items-center py-1 border-b border-red-500/10 last:border-0">
                <span className="text-gray-300">{gear}</span>
                <span className="text-red-500 font-mono">{ratio}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}