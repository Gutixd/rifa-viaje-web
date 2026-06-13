'use client'

import { motion } from 'framer-motion'
import type { RaffleNumber } from '@/types'
import { RAFFLE_CONFIG } from '@/config/raffle'

interface StatsBarProps {
  numbers: RaffleNumber[]
}

export default function StatsBar({ numbers }: StatsBarProps) {
  const available = numbers.filter((n) => n.status === 'available').length
  const reserved = numbers.filter((n) => n.status === 'reserved').length
  const sold = numbers.filter((n) => n.status === 'sold').length
  const total = RAFFLE_CONFIG.totalNumbers

  const soldPct = (sold / total) * 100
  const reservedPct = (reserved / total) * 100

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-2xl p-4 sm:p-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-400">{available}</p>
          <p className="text-xs text-white/40 mt-0.5">Disponibles</p>
        </div>
        <div className="text-center border-x border-surface-600">
          <p className="text-2xl font-bold text-brand-400">{reserved}</p>
          <p className="text-xs text-white/40 mt-0.5">Reservados</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-white/50">{sold}</p>
          <p className="text-xs text-white/40 mt-0.5">Vendidos</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-surface-600 rounded-full overflow-hidden">
        <div className="h-full flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${soldPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-white/30 rounded-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${reservedPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="h-full bg-brand-500/70 rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-white/30">{sold + reserved} de {total} tomados</span>
        <span className="text-xs text-white/30">{available} libres</span>
      </div>
    </div>
  )
}
