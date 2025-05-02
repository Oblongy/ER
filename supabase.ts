import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string
          year: number
          brand: string
          model: string
          created_at: string
        }
        Insert: {
          id?: string
          year: number
          brand: string
          model: string
          created_at?: string
        }
        Update: {
          id?: string
          year?: number
          brand?: string
          model?: string
          created_at?: string
        }
      }
      setups: {
        Row: {
          id: string
          name: string
          car_id: string | null
          parts: Record<string, string>
          gear_ratios: Record<string, number>
          shift_points: Record<string, number>
          nos_points: Record<string, number>
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          car_id?: string | null
          parts?: Record<string, string>
          gear_ratios?: Record<string, number>
          shift_points?: Record<string, number>
          nos_points?: Record<string, number>
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          car_id?: string | null
          parts?: Record<string, string>
          gear_ratios?: Record<string, number>
          shift_points?: Record<string, number>
          nos_points?: Record<string, number>
          user_id?: string
          created_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          date: string | null
          player_count: number
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          date?: string | null
          player_count?: number
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          date?: string | null
          player_count?: number
          user_id?: string
          created_at?: string
        }
      }
      tournament_players: {
        Row: {
          id: string
          tournament_id: string
          name: string
          seed: number
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          seed: number
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          seed?: number
          created_at?: string
        }
      }
      tournament_matches: {
        Row: {
          id: string
          tournament_id: string
          round: number
          position: number
          player1_id: string | null
          player2_id: string | null
          winner_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          round: number
          position: number
          player1_id?: string | null
          player2_id?: string | null
          winner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round?: number
          position?: number
          player1_id?: string | null
          player2_id?: string | null
          winner_id?: string | null
          created_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
    }
  }
}