'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, RefreshCw } from 'lucide-react'
import NumberCell from './NumberCell'
import StatsBar from './StatsBar'
import PurchaseModal from './PurchaseModal'
import type { RaffleNumber, NumberStatus } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { RAFFLE_CONFIG } from '@/config/raffle'

interface NumberGridProps {
  initialNumbers: RaffleNumber[]
}

type Filter = 'all' | NumberStatus

export default function NumberGrid({ initialNumbers }: NumberGridProps) {
  const [numbers, setNumbers] = useState<RaffleNumber[]>(initialNumbers)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [showModal, setShowModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchNumbers = useCallback(async (silent = true) => {
    if (!silent) setIsRefreshing(true)
    try {
      const res = await fetch('/api/numbers')
      if (res.ok) {
        const data: RaffleNumber[] = await res.json()
        setNumbers(data)
        // Remove selected numbers that are no longer available
        setSelected((prev) => {
          const next = new Set<number>()
          prev.forEach((n) => {
            const num = data.find((d) => d.number === n)
            if (num?.status === 'available') next.add(n)
          })
          return next
        })
      }
    } catch {
      // fail silently
    } finally {
      if (!silent) setIsRefreshing(false)
    }
  }, [])

  // Poll every 30s
  useEffect(() => {
    const id = setInterval(() => fetchNumbers(true), 30_000)
    return () => clearInterval(id)
  }, [fetchNumbers])

  const toggleNumber = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(n)) {
        next.delete(n)
      } else {
        next.add(n)
      }
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  const handleSuccess = () => {
    // Refresh after successful reservation
    setTimeout(() => fetchNumbers(true), 1500)
  }

  // Filter & search
  const searchNum = parseInt(search, 10)
  const filtered = numbers.filter((n) => {
    const matchesFilter = filter === 'all' || n.status === filter
    const matchesSearch =
      !search || (Number.isInteger(searchNum) && n.number === searchNum)
    return matchesFilter && matchesSearch
  })

  const selectedList = Array.from(selected).sort((a, b) => a - b)
  const totalSelected = selectedList.length
  const totalAmount = totalSelected * RAFFLE_CONFIG.pricePerNumber

  const filterButtons: { label: string; value: Filter; color: string }[] = [
    { label: 'Todos', value: 'all', color: 'border-surface-500 text-white/60 hover:border-surface-400' },
    { label: 'Disponibles', value: 'available', color: 'border-green-800 text-green-400 hover:border-green-600' },
    { label: 'Reservados', value: 'reserved', color: 'border-brand-800 text-brand-400 hover:border-brand-600' },
    { label: 'Vendidos', value: 'sold', color: 'border-surface-600 text-white/30 hover:border-surface-500' },
  ]

  return (
    <>
      <section id="numeros" className="py-12 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-1">
              Números de la rifa
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Elige los tuyos
            </h2>
          </div>
          <button
            onClick={() => fetchNumbers(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Stats */}
        <div className="mb-5">
          <StatsBar numbers={numbers} />
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="number"
              min={1}
              max={200}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar número exacto..."
              className="w-full bg-surface-800 border border-surface-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                  filter === btn.value
                    ? 'bg-brand-500/15 border-brand-500 text-brand-400'
                    : btn.color
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-white/40">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-surface-800 border border-surface-600" />
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-brand-500" />
            Tu selección
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-brand-900/40 border border-brand-700/40" />
            Reservado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-surface-900 border border-surface-700" />
            Vendido
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            {search ? `No se encontró el número ${search}` : 'No hay números en este estado.'}
          </div>
        ) : (
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
            {filtered.map((n) => (
              <NumberCell
                key={n.id}
                number={n.number}
                status={n.status}
                isSelected={selected.has(n.number)}
                onSelect={toggleNumber}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating selection bar */}
      <AnimatePresence>
        {totalSelected > 0 && (
          <motion.div
            key="selection-bar"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe pb-4 md:bottom-6"
          >
            <div className="max-w-lg mx-auto bg-surface-800 border border-surface-500 rounded-2xl shadow-2xl shadow-black/60 p-4 flex items-center gap-3">
              {/* Numbers preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap max-h-10 overflow-hidden">
                  {selectedList.slice(0, 8).map((n) => (
                    <span
                      key={n}
                      className="bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold px-2 py-0.5 rounded-md"
                    >
                      {n}
                    </span>
                  ))}
                  {selectedList.length > 8 && (
                    <span className="text-xs text-white/40">+{selectedList.length - 8}</span>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-0.5">
                  {totalSelected} número{totalSelected > 1 ? 's' : ''} · {formatCurrency(totalAmount)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={clearSelection}
                  className="p-2 rounded-xl hover:bg-surface-700 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-brand-500 hover:bg-brand-400 active:scale-95 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-all duration-150"
                >
                  Reservar →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase Modal */}
      {showModal && (
        <PurchaseModal
          selectedNumbers={selectedList}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            handleSuccess()
            clearSelection()
          }}
        />
      )}
    </>
  )
}
