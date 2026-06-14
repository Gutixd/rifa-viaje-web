'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, LogOut } from 'lucide-react'
import StatsOverview from '@/components/admin/StatsOverview'
import ReservationCard from '@/components/admin/ReservationCard'
import type { ReservationWithDetails, ReservationStatus, AdminStats } from '@/types'
import { RAFFLE_CONFIG } from '@/config/raffle'
import { supabaseBrowser } from '@/lib/supabase/browser'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'Pendientes', value: 'pending' },
  { label: 'Efectivo', value: 'pending_cash' },
  { label: 'Confirmados', value: 'confirmed' },
  { label: 'Rechazados', value: 'rejected' },
  { label: 'Expirados', value: 'expired' },
  { label: 'Todos', value: 'all' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [reservations, setReservations] = useState<ReservationWithDetails[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true)
    try {
      const [resRes, numbersRes] = await Promise.all([
        fetch('/api/admin/reservations?status=all'),
        fetch('/api/numbers'),
      ])

      if (resRes.status === 401) {
        router.push('/admin/login')
        return
      }

      const allReservations: ReservationWithDetails[] = await resRes.json()
      const numbers = await numbersRes.json()

      setReservations(allReservations)

      // Compute stats
      const available = numbers.filter((n: { status: string }) => n.status === 'available').length
      const reserved = numbers.filter((n: { status: string }) => n.status === 'reserved').length
      const sold = numbers.filter((n: { status: string }) => n.status === 'sold').length

      const confirmed = allReservations.filter((r) => r.status === 'confirmed')
      const total_revenue = confirmed.reduce((acc, r) => acc + r.total_amount, 0)

      const pending_count = allReservations.filter((r) => r.status === 'pending').length
      const pending_cash_count = allReservations.filter((r) => r.status === 'pending_cash').length

      setStats({
        total: RAFFLE_CONFIG.totalNumbers,
        available,
        reserved,
        sold,
        total_revenue,
        pending_count,
        pending_cash_count,
      })
    } catch (err) {
      console.error('Error fetching admin data:', err)
    } finally {
      setLoading(false)
      if (showSpinner) setIsRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
    let debounce: ReturnType<typeof setTimeout>

    const channel = supabaseBrowser
      .channel('admin-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        clearTimeout(debounce)
        debounce = setTimeout(() => fetchData(), 300)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'raffle_numbers' }, () => {
        clearTimeout(debounce)
        debounce = setTimeout(() => fetchData(), 300)
      })
      .subscribe()

    const fallback = setInterval(() => fetchData(), 120_000)

    return () => {
      clearTimeout(debounce)
      supabaseBrowser.removeChannel(channel)
      clearInterval(fallback)
    }
  }, [fetchData])

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const filtered =
    activeTab === 'all'
      ? reservations
      : reservations.filter((r) => r.status === activeTab)

  const tabCount = (status: string) =>
    status === 'all'
      ? reservations.length
      : reservations.filter((r) => r.status === status).length

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-surface-700 px-4 py-4 flex items-center justify-between sticky top-0 bg-[#05050f]/95 backdrop-blur z-10">
        <div>
          <h1 className="font-display font-bold text-white text-lg">Panel Admin</h1>
          <p className="text-xs text-white/30">Rifa 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-2 rounded-lg hover:bg-surface-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-surface-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        {stats && <StatsOverview stats={stats} />}

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => {
            const count = tabCount(tab.value)
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === tab.value
                    ? 'bg-brand-500/15 border border-brand-500/40 text-brand-400'
                    : 'border border-surface-600 text-white/40 hover:text-white/60 hover:border-surface-500'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                      activeTab === tab.value
                        ? 'bg-brand-500/30 text-brand-300'
                        : 'bg-surface-600 text-white/40'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Reservations list */}
        {loading ? (
          <div className="text-center py-16 text-white/30 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            No hay reservas en este estado.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                onUpdate={() => fetchData(false)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
