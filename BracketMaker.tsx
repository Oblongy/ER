import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimate } from 'framer-motion'
import { Trophy, Users, Plus, X, Crown, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

interface Player {
  id: string
  name: string
  seed: number
  tournament_id?: string
}

interface Match {
  id: string
  round: number
  position: number
  player1?: Player
  player2?: Player
  winner?: Player
  tournament_id?: string
}

interface Tournament {
  id: string
  name: string
  description?: string
  player_count: number
  date?: string
}

const PLAYER_COUNTS = [2, 4, 8, 16, 32]

export default function BracketMaker() {
  const [players, setPlayers] = useState<Player[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [playerCount, setPlayerCount] = useState<number>(8)
  const [showPlayerInput, setShowPlayerInput] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null)
  const [customCount, setCustomCount] = useState('')
  const [tournamentName, setTournamentName] = useState('New Tournament')
  const [tournamentDesc, setTournamentDesc] = useState('')
  const [savedTournaments, setSavedTournaments] = useState<Tournament[]>([])
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchTournaments()
    }
  }, [user])

  const fetchTournaments = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setSavedTournaments(data as Tournament[])
    } catch (err) {
      console.error('Error fetching tournaments:', err)
    }
  }

  const loadTournament = async (tournamentId: string) => {
    try {
      // Get tournament
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single()
      
      if (tournamentError) throw tournamentError
      
      // Get players
      const { data: playersData, error: playersError } = await supabase
        .from('tournament_players')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('seed', { ascending: true })
      
      if (playersError) throw playersError
      
      // Get matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('tournament_matches')
        .select(`
          id, 
          round, 
          position, 
          tournament_id,
          player1:player1_id(id, name, seed), 
          player2:player2_id(id, name, seed), 
          winner:winner_id(id, name, seed)
        `)
        .eq('tournament_id', tournamentId)
      
      if (matchesError) throw matchesError
      
      // Set state
      setCurrentTournament(tournamentData)
      setTournamentName(tournamentData.name)
      setTournamentDesc(tournamentData.description || '')
      setPlayerCount(tournamentData.player_count)
      setPlayers(playersData as Player[])
      
      // Format matches
      const formattedMatches = matchesData.map((match: any) => ({
        id: match.id,
        round: match.round,
        position: match.position,
        player1: match.player1,
        player2: match.player2,
        winner: match.winner,
        tournament_id: match.tournament_id
      }))
      
      setMatches(formattedMatches)
    } catch (err) {
      console.error('Error loading tournament:', err)
    }
  }

  const handleCustomCount = (value: string) => {
    const num = parseInt(value)
    if (!isNaN(num) && num >= 2 && num <= 32) {
      setPlayerCount(num)
      setCustomCount('')
    }
  }

  const updatePlayerName = (playerId: string, newName: string) => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, name: newName } : p
    ))
    setEditingPlayer(null)
  }

  const generateBracket = () => {
    const totalRounds = Math.log2(playerCount)
    const totalMatches = playerCount - 1
    const newMatches: Match[] = []
    
    // Generate all matches
    for (let round = 1; round <= totalRounds; round++) {
      const matchesInRound = playerCount / Math.pow(2, round)
      for (let position = 1; position <= matchesInRound; position++) {
        newMatches.push({
          id: `R${round}M${position}`,
          round,
          position,
          player1: undefined,
          player2: undefined
        })
      }
    }

    // Seed first round with players
    const shuffledPlayers = [...players]
      .sort((a, b) => a.seed - b.seed)
      .slice(0, playerCount)
    
    let playerIndex = 0
    for (let i = 0; i < newMatches.length; i++) {
      if (newMatches[i].round === 1) {
        newMatches[i].player1 = shuffledPlayers[playerIndex++]
        newMatches[i].player2 = shuffledPlayers[playerIndex++]
      }
    }

    setMatches(newMatches)
    setCurrentTournament(null)
  }

  const handleWinner = (match: Match, winner: Player) => {
    const updatedMatches = [...matches]
    const matchIndex = updatedMatches.findIndex(m => m.id === match.id)
    updatedMatches[matchIndex].winner = winner

    // Advance winner to next round
    if (match.round < Math.log2(playerCount)) {
      const nextRoundMatch = updatedMatches.find(
        m => m.round === match.round + 1 && 
        Math.ceil(match.position / 2) === m.position
      )
      
      if (nextRoundMatch) {
        const isFirstMatch = match.position % 2 === 1
        if (isFirstMatch) {
          nextRoundMatch.player1 = winner
        } else {
          nextRoundMatch.player2 = winner
        }
      }
    }

    setMatches(updatedMatches)
  }

  const addPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayers(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          name: newPlayerName.trim(),
          seed: prev.length + 1
        }
      ])
      setNewPlayerName('')
      setShowPlayerInput(false)
    }
  }

  const removePlayer = (playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId))
  }

  const saveTournament = async () => {
    if (!user) {
      setError('You must be logged in to save tournaments')
      return
    }
    
    setIsSaving(true)
    setError(null)
    
    try {
      let tournamentId
      
      // Save or update tournament
      if (currentTournament?.id) {
        // Update existing tournament
        const { data, error } = await supabase
          .from('tournaments')
          .update({
            name: tournamentName,
            description: tournamentDesc,
            player_count: playerCount
          })
          .eq('id', currentTournament.id)
          .select()
        
        if (error) throw error
        tournamentId = currentTournament.id
      } else {
        // Create new tournament
        const { data, error } = await supabase
          .from('tournaments')
          .insert({
            name: tournamentName,
            description: tournamentDesc,
            player_count: playerCount,
            user_id: user.id
          })
          .select()
        
        if (error) throw error
        tournamentId = data[0].id
      }
      
      // Save players
      if (players.length > 0) {
        // Delete existing players
        if (currentTournament?.id) {
          await supabase
            .from('tournament_players')
            .delete()
            .eq('tournament_id', tournamentId)
        }
        
        // Insert new players
        const playersToInsert = players.map(player => ({
          tournament_id: tournamentId,
          name: player.name,
          seed: player.seed
        }))
        
        const { error: playersError } = await supabase
          .from('tournament_players')
          .insert(playersToInsert)
        
        if (playersError) throw playersError
      }
      
      // Save matches if there are any
      if (matches.length > 0) {
        // Delete existing matches
        if (currentTournament?.id) {
          await supabase
            .from('tournament_matches')
            .delete()
            .eq('tournament_id', tournamentId)
        }
        
        // Get the newly created players to get their IDs
        const { data: newPlayers, error: playersFetchError } = await supabase
          .from('tournament_players')
          .select('*')
          .eq('tournament_id', tournamentId)
        
        if (playersFetchError) throw playersFetchError
        
        // Create a map of player names to IDs
        const playerMap = new Map()
        newPlayers.forEach(player => {
          playerMap.set(player.name, player.id)
        })
        
        // Insert matches
        const matchesToInsert = matches.map(match => ({
          tournament_id: tournamentId,
          round: match.round,
          position: match.position,
          player1_id: match.player1 ? playerMap.get(match.player1.name) : null,
          player2_id: match.player2 ? playerMap.get(match.player2.name) : null,
          winner_id: match.winner ? playerMap.get(match.winner.name) : null
        }))
        
        const { error: matchesError } = await supabase
          .from('tournament_matches')
          .insert(matchesToInsert)
        
        if (matchesError) throw matchesError
      }
      
      // Update state
      fetchTournaments()
      setCurrentTournament({
        id: tournamentId,
        name: tournamentName,
        description: tournamentDesc,
        player_count: playerCount
      })
    } catch (err) {
      console.error('Error saving tournament:', err)
      setError('Failed to save tournament')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="fixed inset-0 bg-[url('/src/bk.png')] bg-cover bg-center opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black/30 to-black/90 pointer-events-none" />
      
      <div className="relative z-20 max-w-7xl mx-auto">
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold font-orbitron">Tournament Bracket</h1>
          </div>
          
          {user && (
            <button
              onClick={saveTournament}
              disabled={isSaving}
              className={`flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'Saving...' : 'Save Tournament'}</span>
            </button>
          )}
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
                  You need to <a href="/login" className="text-red-400 hover:text-red-300 underline">log in</a> or <a href="/register" className="text-red-400 hover:text-red-300 underline">register</a> to save your tournament brackets.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-100 rounded-lg border border-red-500/30 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            className="lg:col-span-1 bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm p-6 rounded-lg border border-red-500/20"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Tournament Name
                </label>
                <input 
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  className="w-full bg-gray-800/50 border border-red-500/20 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500/40"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={tournamentDesc}
                  onChange={(e) => setTournamentDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-gray-800/50 border border-red-500/20 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500/40"
                ></textarea>
              </div>
            </div>
            
            {user && savedTournaments.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Your Saved Tournaments
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {savedTournaments.map(tournament => (
                    <button
                      key={tournament.id}
                      onClick={() => loadTournament(tournament.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                        currentTournament?.id === tournament.id 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/50'
                      }`}
                    >
                      {tournament.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold">Players</h2>
              </div>
              <button
                onClick={() => setShowPlayerInput(true)}
                className="p-2 rounded-full hover:bg-red-500/10 transition-colors"
              >
                <Plus className="w-5 h-5 text-red-500" />
              </button>
            </div>

            <AnimatePresence>
              {showPlayerInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="Enter player name"
                      className="flex-1 bg-gray-800/50 border border-red-500/20 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/40"
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                    />
                    <button
                      onClick={addPlayer}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {players.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-red-500 font-mono w-6 text-center">#{player.seed}</span>
                      {editingPlayer === player.id ? (
                        <input
                          type="text"
                          defaultValue={player.name}
                          autoFocus
                          onBlur={(e) => updatePlayerName(player.id, e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && updatePlayerName(player.id, e.target.value)}
                          className="bg-gray-800/50 border border-red-500/20 rounded px-2 py-1 text-white focus:outline-none focus:border-red-500/40"
                        />
                      ) : (
                        <span
                          onClick={() => setEditingPlayer(player.id)}
                          className="cursor-pointer hover:text-red-500 transition-colors"
                        >
                          {player.name}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="p-1 hover:bg-red-500/10 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Tournament Size
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="number"
                    min="2"
                    max="32"
                    value={customCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                    onBlur={() => handleCustomCount(customCount)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomCount(customCount)}
                    placeholder="Custom"
                    className="w-20 px-2 py-1 bg-gray-800 text-white rounded-full text-sm border border-red-500/20 focus:outline-none focus:border-red-500/40"
                  />
                  {PLAYER_COUNTS.map(count => (
                    <button
                      key={count}
                      onClick={() => setPlayerCount(count)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        playerCount === count
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {count} Players
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateBracket}
                disabled={players.length < 2}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-lg hover:shadow-red-500/25"
              >
                Generate Bracket
              </button>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-2 bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm p-6 rounded-lg border border-red-500/20 overflow-x-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="min-w-[800px]">
              <div className="flex justify-between items-stretch h-[600px]">
                {matches.length > 0 ? (
                  Array.from({ length: Math.log2(playerCount) }).map((_, roundIndex) => (
                    <div
                      key={roundIndex}
                      className="flex-1 flex flex-col justify-around px-2"
                      style={{
                        marginTop: `${roundIndex * 40}px`,
                        marginBottom: `${roundIndex * 40}px`
                      }}
                    >
                      {matches
                        .filter(match => match.round === roundIndex + 1)
                        .map(match => (
                          <Match
                            key={match.id}
                            match={match}
                            onSelectWinner={handleWinner}
                            playerCount={playerCount}
                          />
                        ))}
                    </div>
                  ))
                ) : (
                  <div className="w-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                      <p className="text-lg">Add players and generate a bracket to get started</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Match({ 
  match, 
  onSelectWinner, 
  playerCount 
}: { 
  match: Match; 
  onSelectWinner: (match: Match, winner: Player) => void;
  playerCount: number;
}) {
  const [scope, animate] = useAnimate()

  const handleWinnerSelection = async (player: Player) => {
    onSelectWinner(match, player)
    
    // Enhanced victory animation sequence
    await animate(scope.current, {
      scale: [1, 1.1, 1],
      borderColor: ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.2)'],
      boxShadow: ['0 0 0px rgba(239, 68, 68, 0)', '0 0 20px rgba(239, 68, 68, 0.4)', '0 0 0px rgba(239, 68, 68, 0)']
    }, { duration: 0.4, ease: 'easeOut' })
    
    // Enhanced particle effects
    const particles = Array.from({ length: 12 }).map((_, i) => {
      const particle = document.createElement('div')
      particle.className = `absolute w-2 h-2 rounded-full ${
        i % 2 === 0 ? 'bg-red-500' : 'bg-yellow-500'
      }`
      scope.current.appendChild(particle)
      
      const angle = (i / 12) * Math.PI * 2
      const distance = 60 + Math.random() * 20
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      
      animate(particle, {
        opacity: [1, 1, 0],
        x: [0, x * 0.5, x],
        y: [0, y * 0.5, y],
        scale: [0, 1.2, 0]
      }, {
        duration: 0.8,
        ease: 'easeOut',
        times: [0, 0.6, 1]
      }).then(() => particle.remove())
    })

    // Special animation for tournament winner
    if (match.round === Math.log2(playerCount)) {
      const crown = document.createElement('div')
      crown.innerHTML = '<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15 5L19 4L18 8L22 11L19 13L20 17L16 16L13 19L12 22L11 19L8 16L4 17L5 13L2 11L6 8L5 4L9 5L12 2Z" /></svg>'
      crown.className = 'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-yellow-500'
      scope.current.appendChild(crown)
      
      await animate(crown, {
        opacity: [0, 1, 1],
        y: [20, -30, -30],
        scale: [0.5, 1.2, 1]
      }, {
        duration: 1,
        ease: 'backOut'
      })
      
      animate(crown, {
        y: [-30, -25, -30],
        rotate: [-5, 5, -5]
      }, { 
        duration: 2, 
        repeat: Infinity, 
        ease: 'easeInOut' 
      })
    }
  }

  return (
    <motion.div
      ref={scope}
      className="relative bg-gray-800/30 rounded-lg p-3 border border-red-500/20 transition-shadow duration-300"
    >
      {match.player1 && (
        <button
          onClick={() => match.player1 && handleWinnerSelection(match.player1)}
          className={`w-full text-left px-3 py-2 rounded ${
            match.winner?.id === match.player1.id
              ? 'bg-red-500 text-white'
              : 'hover:bg-gray-700'
          }`}
        >
          <span className="font-mono mr-2">#{match.player1.seed}</span>
          {match.player1.name}
        </button>
      )}
      
      {match.player2 && (
        <button
          onClick={() => match.player2 && handleWinnerSelection(match.player2)}
          className={`w-full text-left px-3 py-2 rounded mt-2 ${
            match.winner?.id === match.player2.id
              ? 'bg-red-500 text-white'
              : 'hover:bg-gray-700'
          }`}
        >
          <span className="font-mono mr-2">#{match.player2.seed}</span>
          {match.player2.name}
        </button>
      )}
    </motion.div>
  )
}