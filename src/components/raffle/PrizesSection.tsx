'use client'

import { motion } from 'framer-motion'
import { RAFFLE_CONFIG } from '@/config/raffle'

export default function PrizesSection() {
  return (
    <section id="premios" className="py-16 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
          Premios
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          ¿Qué puedes ganar?
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {RAFFLE_CONFIG.prizes.map((prize, i) => (
          <motion.div
            key={prize.rank}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className={`relative rounded-2xl p-6 border text-center overflow-hidden ${
              prize.highlight
                ? 'bg-gradient-to-b from-brand-500/20 to-surface-800 border-brand-500/40 shadow-lg shadow-brand-500/10'
                : 'bg-surface-800 border-surface-600'
            }`}
          >
            {prize.highlight && (
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent" />
            )}
            <div className="text-4xl mb-3">{prize.emoji}</div>
            <p
              className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                prize.highlight ? 'text-brand-400' : 'text-white/40'
              }`}
            >
              {prize.label}
            </p>
            <h3 className="text-lg font-bold text-white mb-2">{prize.name}</h3>
            <p className="text-sm text-white/50 leading-relaxed">{prize.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
