import React from 'react'
import { motion } from 'framer-motion'
import { Users } from 'lucide-react'

export default function Team() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/videos/NSX.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black/30 to-black/90 pointer-events-none" />
      
      <div className="relative z-20 max-w-6xl mx-auto">
        <motion.div 
          className="flex items-center space-x-3 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Users className="w-8 h-8 text-red-500" />
          <h1 className="text-4xl font-bold font-orbitron">Meet the Envious Racing Crew</h1>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <TeamMember
            name="Venom"
            role="Leader"
            description="Number one on the leaderboard. His precision and fearless attitude make him a cornerstone of Envious Racing."
            delay={0}
          />
          
          <TeamMember
            name="GR3DDY"
            role="Co-Leader"
            description="Number two on the leaderboard. Keeping the momentum going with unmatched expertise and dedication."
            delay={0.2}
          />
          
          <TeamMember
            name="OBLONG"
            role="Recruiter"
            description="Number three on the leaderboard. Sharp mind and strategic planning keeps the team ahead of the competition."
            delay={0.4}
          />
          
          <TeamMember
            name="PlayerNerfed"
            role="Member"
            description="From virtual racing to real tracks, bringing competitive gaming skills and precision to every race."
            delay={0.6}
          />
        </div>
      </div>
    </div>
  )
}

interface TeamMemberProps {
  name: string
  role: string
  description: string
  delay: number
}

function TeamMember({ name, role, description, delay }: TeamMemberProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-gray-900/70 to-black/70 backdrop-blur-sm p-6 rounded-3xl border border-red-500/20 hover:border-red-500/40 shadow-lg hover:shadow-red-500/10 transition-all duration-300 hover:scale-105"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div>
          <h3 className="text-xl font-bold font-orbitron text-white">{name}</h3>
          <p className="text-red-500 font-medium">{role}</p>
        </div>
      </div>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  )
}