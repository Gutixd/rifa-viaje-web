'use client'

import { motion } from 'framer-motion'
import { RAFFLE_CONFIG } from '@/config/raffle'
import CountdownTimer from './CountdownTimer'
import { formatCurrency } from '@/lib/utils'

export default function HeroSection() {
  const scrollToNumbers = () => {
    document.getElementById('numeros')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Ambient glow blobs */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-600/5 rounded-full blur-[80px]" />
      </div>

      {/* Subtle grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,.15) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider"
        >
          🎟️ <span>200 números · {formatCurrency(RAFFLE_CONFIG.pricePerNumber)} c/u</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4"
        >
          {RAFFLE_CONFIG.name}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-white/50 text-base sm:text-lg mb-10 max-w-md"
        >
          {RAFFLE_CONFIG.subtitle}
        </motion.p>

        {/* Countdown */}
        <div className="mb-10">
          <CountdownTimer />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <button
            onClick={scrollToNumbers}
            className="group relative bg-brand-500 hover:bg-brand-400 text-black font-bold px-8 py-4 rounded-2xl text-base transition-all duration-200 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              Ver números disponibles
              <span className="group-hover:translate-x-0.5 transition-transform duration-150">→</span>
            </span>
          </button>
          <button
            onClick={() => document.getElementById('premios')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-white/50 hover:text-white text-sm font-medium transition-colors"
          >
            Ver premios ↓
          </button>
        </motion.div>

        {/* Floating numbers decoration */}
        {[7, 42, 100, 150, 199].map((n, i) => (
          <motion.span
            key={n}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="absolute text-white/5 font-bold select-none pointer-events-none"
            style={{
              fontSize: `${48 + i * 10}px`,
              left: `${[5, 80, 15, 70, 40][i]}%`,
              top: `${[10, 15, 75, 70, 85][i]}%`,
              animation: `float ${5 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          >
            {n}
          </motion.span>
        ))}
      </div>
    </section>
  )
}
