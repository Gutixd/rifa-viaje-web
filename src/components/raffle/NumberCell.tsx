'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { NumberStatus } from '@/types'

interface NumberCellProps {
  number: number
  status: NumberStatus
  isSelected: boolean
  onSelect: (n: number) => void
}

export default function NumberCell({
  number,
  status,
  isSelected,
  onSelect,
}: NumberCellProps) {
  const isAvailable = status === 'available'
  const isClickable = isAvailable

  return (
    <motion.button
      disabled={!isClickable}
      onClick={() => isClickable && onSelect(number)}
      whileHover={isClickable ? { scale: 1.08 } : {}}
      whileTap={isClickable ? { scale: 0.92 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      aria-label={`Número ${number} — ${status}`}
      className={cn(
        'aspect-square rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold',
        'flex items-center justify-center transition-colors duration-150',
        isSelected
          ? 'bg-brand-500 border-2 border-brand-300 text-black shadow-lg shadow-brand-500/40'
          : isAvailable
          ? 'bg-surface-800 border border-surface-600 text-white/80 hover:border-brand-500/60 hover:bg-surface-700 hover:text-white cursor-pointer'
          : status === 'reserved'
          ? 'bg-brand-900/40 border border-brand-700/40 text-brand-500/60 cursor-not-allowed'
          : 'bg-surface-900 border border-surface-700 text-white/15 cursor-not-allowed'
      )}
    >
      {number}
    </motion.button>
  )
}
