import React from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

const Home = () => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-screen flex items-start justify-center overflow-hidden pt-32">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/90 z-0" />
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        >
          <source src="/videos/Home copy.mp4" type="video/mp4" />
        </video>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-wider mb-8 font-orbitron animate-title-slide">
            <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-transparent bg-clip-text inline-block hover:scale-105 transition-transform duration-300">
              ENVIOUS RACING
            </span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 max-w-3xl mx-auto font-rajdhani font-medium animate-fade-in px-4">
            Pushing the limits of speed and precision in professional racing
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default Home