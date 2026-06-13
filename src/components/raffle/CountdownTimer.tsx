'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getTimeUntil } from '@/lib/utils'
import { RAFFLE_CONFIG } from '@/config/raffle'

interface TimeUnit {
  value: number
  label: string
}

function TimeBlock({ value, label }: TimeUnit) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-surface-800 border border-surface-600 rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-1.5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
        <span className="font-display font-bold text-2xl sm:text-3xl text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function CountdownTimer() {
  const [time, setTime] = useState(getTimeUntil(RAFFLE_CONFIG.endDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeUntil(RAFFLE_CONFIG.endDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (time.expired) {
    return (
      <div className="text-center text-white/50 text-sm py-2">
        La rifa ha finalizado
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-col items-center gap-3"
    >
      <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
        Cierra el 10 de agosto de 2026
      </p>
      <div className="flex items-center gap-2 sm:gap-3">
        <TimeBlock value={time.days} label="Días" />
        <span className="text-brand-500 text-2xl font-bold pb-5">:</span>
        <TimeBlock value={time.hours} label="Horas" />
        <span className="text-brand-500 text-2xl font-bold pb-5">:</span>
        <TimeBlock value={time.minutes} label="Min" />
        <span className="text-brand-500 text-2xl font-bold pb-5">:</span>
        <TimeBlock value={time.seconds} label="Seg" />
      </div>
    </motion.div>
  )
}
