'use client'

import type { AdminStats } from '@/types'
import { formatCurrency } from '@/lib/utils'

const cards = [
  {
    key: 'available' as const,
    label: 'Disponibles',
    color: 'text-green-400',
    bg: 'bg-green-500/8 border-green-800/40',
  },
  {
    key: 'reserved' as const,
    label: 'Reservados',
    color: 'text-amber-400',
    bg: 'bg-amber-500/8 border-amber-800/40',
  },
  {
    key: 'sold' as const,
    label: 'Vendidos',
    color: 'text-blue-400',
    bg: 'bg-blue-500/8 border-blue-800/40',
  },
  {
    key: 'pending_count' as const,
    label: 'Pendientes',
    color: 'text-orange-400',
    bg: 'bg-orange-500/8 border-orange-800/40',
  },
]

export default function StatsOverview({ stats }: { stats: AdminStats }) {
  return (
    <div className="space-y-4">
      {/* Revenue highlight */}
      <div className="bg-gradient-to-r from-brand-500/15 to-orange-500/10 border border-brand-500/25 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider font-medium mb-1">
            Total recaudado
          </p>
          <p className="text-3xl font-bold text-white">{formatCurrency(stats.total_revenue)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40">{stats.sold} vendidos</p>
          <p className="text-xs text-white/40">{stats.total} totales</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`${card.bg} border rounded-xl p-4`}
          >
            <p className={`text-2xl font-bold ${card.color}`}>{stats[card.key]}</p>
            <p className="text-xs text-white/40 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
