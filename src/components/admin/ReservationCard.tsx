'use client'

import { useState } from 'react'
import { Check, X, Loader2, Phone, Mail, MessageSquare, Trash2 } from 'lucide-react'
import type { ReservationWithDetails } from '@/types'
import { formatCurrency, formatDate, statusLabel } from '@/lib/utils'

interface ReservationCardProps {
  reservation: ReservationWithDetails
  onUpdate: () => void
}

const statusStyles: Record<string, string> = {
  pending: 'bg-blue-500/15 border-blue-700/40 text-blue-300',
  pending_cash: 'bg-yellow-500/15 border-yellow-700/40 text-yellow-300',
  confirmed: 'bg-green-500/15 border-green-700/40 text-green-300',
  rejected: 'bg-red-500/15 border-red-700/40 text-red-300',
  expired: 'bg-surface-700 border-surface-500 text-white/30',
}

export default function ReservationCard({ reservation, onUpdate }: ReservationCardProps) {
  const [loading, setLoading] = useState<'confirm' | 'reject' | 'delete' | null>(null)

  const canAct = ['pending', 'pending_cash'].includes(reservation.status)

  const handleConfirm = async () => {
    setLoading('confirm')
    try {
      await fetch('/api/admin/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservation.id }),
      })
      onUpdate()
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    if (!confirm(`¿Rechazar la reserva de ${reservation.buyer.full_name}?`)) return
    setLoading('reject')
    try {
      await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservation.id }),
      })
      onUpdate()
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    const msg =
      reservation.status === 'confirmed'
        ? `⚠️ Esto eliminará una venta CONFIRMADA de ${reservation.buyer.full_name} y liberará los números ${reservation.numbers.join(', ')}. ¿Continuar?`
        : `¿Eliminar definitivamente la reserva de ${reservation.buyer.full_name}?`
    if (!confirm(msg)) return
    setLoading('delete')
    try {
      await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservation.id }),
      })
      onUpdate()
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-surface-800 border border-surface-600 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white text-sm">{reservation.buyer.full_name}</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {formatDate(reservation.created_at)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                statusStyles[reservation.status] ?? ''
              }`}
            >
              {statusLabel(reservation.status)}
            </span>
            <button
              onClick={handleDelete}
              disabled={loading !== null}
              title="Eliminar reserva"
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
            >
              {loading === 'delete' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <span className="text-xs font-bold text-brand-400">
            {formatCurrency(reservation.total_amount)}
          </span>
        </div>
      </div>

      {/* Buyer info */}
      <div className="flex flex-wrap gap-3 text-xs text-white/50">
        <a href={`tel:${reservation.buyer.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
          <Phone className="w-3.5 h-3.5" />
          {reservation.buyer.phone}
        </a>
        <a href={`mailto:${reservation.buyer.email}`} className="flex items-center gap-1 hover:text-white transition-colors">
          <Mail className="w-3.5 h-3.5" />
          {reservation.buyer.email}
        </a>
        {reservation.buyer.comments && (
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {reservation.buyer.comments}
          </span>
        )}
      </div>

      {/* Numbers */}
      <div>
        <p className="text-xs text-white/30 mb-1.5">Números</p>
        <div className="flex flex-wrap gap-1.5">
          {reservation.numbers.map((n) => (
            <span
              key={n}
              className="bg-surface-700 border border-surface-500 text-white/70 text-xs font-bold px-2 py-0.5 rounded-md"
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Payment method */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">
          {reservation.payment_method === 'transfer' ? '💸 Transferencia' : '💵 Efectivo'}
        </span>
        {reservation.expires_at && reservation.status !== 'confirmed' && (
          <span className="text-white/30">
            Expira: {formatDate(reservation.expires_at)}
          </span>
        )}
      </div>

      {/* Actions */}
      {canAct && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleConfirm}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/15 hover:bg-green-500/25 border border-green-700/40 text-green-400 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {loading === 'confirm' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Confirmar pago
          </button>
          <button
            onClick={handleReject}
            disabled={loading !== null}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-800/40 text-red-400 font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {loading === 'reject' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            Rechazar
          </button>
        </div>
      )}
    </div>
  )
}
