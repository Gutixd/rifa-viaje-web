'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, AlertCircle, Loader2, Copy } from 'lucide-react'
import { RAFFLE_CONFIG } from '@/config/raffle'
import type { PaymentMethod } from '@/types'

interface PurchaseModalProps {
  selectedNumbers: number[]
  onClose: () => void
  onSuccess: () => void
}

type Step = 'form' | 'loading' | 'success' | 'error'

export default function PurchaseModal({
  selectedNumbers,
  onClose,
  onSuccess,
}: PurchaseModalProps) {
  const [step, setStep] = useState<Step>('form')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer')
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    comments: '',
  })
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedField, setCopiedField] = useState('')

  const totalAmount = selectedNumbers.length * RAFFLE_CONFIG.pricePerNumber

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep('loading')

    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: selectedNumbers,
          full_name: formData.full_name,
          phone: formData.phone,
          email: formData.email,
          payment_method: paymentMethod,
          comments: formData.comments || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Error al procesar la solicitud.')
        setStep('error')
        return
      }

      setStep('success')
      onSuccess()
    } catch {
      setErrorMessage('Error de conexión. Por favor intenta de nuevo.')
      setStep('error')
    }
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(''), 2000)
    } catch {
      // Clipboard not available
    }
  }

  const inputClass =
    'w-full bg-surface-700 border border-surface-500 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-brand-500 transition-colors text-sm'

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={step !== 'loading' ? onClose : undefined}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
      />

      {/* Sheet */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-surface-800 rounded-t-3xl max-h-[92dvh] overflow-y-auto
                   md:inset-0 md:m-auto md:rounded-2xl md:max-w-md md:max-h-[88vh] md:bottom-auto md:top-auto"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-surface-500 rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-surface-800 px-6 py-4 border-b border-surface-600 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            {step === 'form' && `Reservar ${selectedNumbers.length} número${selectedNumbers.length > 1 ? 's' : ''}`}
            {step === 'loading' && 'Procesando reserva...'}
            {step === 'success' && '¡Reserva confirmada!'}
            {step === 'error' && 'Algo salió mal'}
          </h2>
          {step !== 'loading' && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-surface-700 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* ── FORM ─────────────────────────────────────────────────────────── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selected numbers summary */}
              <div className="bg-surface-700 rounded-xl p-4">
                <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">
                  Números seleccionados
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedNumbers.map((n) => (
                    <span
                      key={n}
                      className="bg-brand-500/20 border border-brand-500/40 text-brand-400 text-xs font-bold px-2.5 py-1 rounded-lg"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="pt-3 border-t border-surface-600 flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    {selectedNumbers.length} × ${RAFFLE_CONFIG.pricePerNumber.toLocaleString('es-CL')}
                  </span>
                  <span className="text-brand-400 font-bold text-lg">
                    ${totalAmount.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block font-medium">
                    Nombre completo *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, full_name: e.target.value }))
                    }
                    placeholder="Tu nombre completo"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1.5 block font-medium">
                    Teléfono *
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+56 9 1234 5678"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1.5 block font-medium">
                    Correo electrónico *
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="tu@correo.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 mb-1.5 block font-medium">
                    Comentarios (opcional)
                  </label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, comments: e.target.value }))
                    }
                    placeholder="Información adicional..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {/* Payment method */}
              <div>
                <label className="text-xs text-white/50 mb-3 block font-medium uppercase tracking-wider">
                  Método de pago *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: 'transfer', emoji: '💸', label: 'Transferencia' },
                      { value: 'cash', emoji: '💵', label: 'Efectivo' },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPaymentMethod(m.value)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        paymentMethod === m.value
                          ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                          : 'border-surface-500 text-white/40 hover:border-surface-400 hover:text-white/60'
                      }`}
                    >
                      <div className="text-2xl mb-1">{m.emoji}</div>
                      <div className="text-xs font-semibold">{m.label}</div>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'transfer' && (
                  <p className="text-xs text-blue-300/70 mt-2 bg-blue-950/40 border border-blue-800/30 rounded-lg p-2.5">
                    Recibirás los datos de transferencia al confirmar.
                  </p>
                )}
                {paymentMethod === 'cash' && (
                  <p className="text-xs text-yellow-300/70 mt-2 bg-yellow-950/40 border border-yellow-800/30 rounded-lg p-2.5">
                    Nos contactaremos para coordinar el pago. Tienes 10 minutos de reserva.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-400 active:scale-95 text-black font-bold py-4 rounded-xl text-sm transition-all duration-150 shadow-lg shadow-brand-500/20"
              >
                Confirmar reserva · ${totalAmount.toLocaleString('es-CL')}
              </button>

              <p className="text-xs text-center text-white/25">
                Tus números se reservan por{' '}
                <strong className="text-white/40">{RAFFLE_CONFIG.reservationMinutes} minutos</strong>.
                El pago es manual y confirmado por el organizador.
              </p>
            </form>
          )}

          {/* ── LOADING ───────────────────────────────────────────────────────── */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
              <p className="text-white/50 text-sm">Reservando tus números...</p>
            </div>
          )}

          {/* ── SUCCESS ───────────────────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center py-4 gap-3">
                <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">¡Números reservados!</h3>
                  <p className="text-sm text-white/50">
                    Tienes{' '}
                    <strong className="text-white/70">
                      {RAFFLE_CONFIG.reservationMinutes} minutos
                    </strong>{' '}
                    para pagar. El organizador lo confirmará manualmente.
                  </p>
                </div>
              </div>

              {paymentMethod === 'transfer' && (
                <div className="bg-surface-700 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                    Datos de transferencia
                  </p>
                  {([
                    ['Banco', RAFFLE_CONFIG.transferInfo.bank],
                    ['Tipo cuenta', RAFFLE_CONFIG.transferInfo.accountType],
                    ['N° cuenta', RAFFLE_CONFIG.transferInfo.accountNumber],
                    ['RUT', RAFFLE_CONFIG.transferInfo.rut],
                    ['Titular', RAFFLE_CONFIG.transferInfo.name],
                    ['Email', RAFFLE_CONFIG.transferInfo.email],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-white/30">{label}</p>
                        <p className="text-sm text-white font-medium truncate">{value}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(value, label)}
                        className="flex-shrink-0 p-1.5 rounded-lg hover:bg-surface-600 text-white/30 hover:text-brand-400 transition-colors"
                      >
                        {copiedField === label ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-white/30 pt-2 border-t border-surface-600">
                    {RAFFLE_CONFIG.transferInfo.instructions}
                  </p>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="bg-surface-700 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-white/70">{RAFFLE_CONFIG.cashInfo.instructions}</p>
                  <p className="text-brand-400 font-semibold">{RAFFLE_CONFIG.cashInfo.contact}</p>
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full bg-surface-700 hover:bg-surface-600 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
              >
                Entendido, cerrar
              </button>
            </div>
          )}

          {/* ── ERROR ─────────────────────────────────────────────────────────── */}
          {step === 'error' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center text-center py-4 gap-3">
                <div className="w-16 h-16 bg-red-500/15 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">No se pudo reservar</h3>
                  <p className="text-sm text-white/50">{errorMessage}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="bg-surface-700 hover:bg-surface-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Volver
                </button>
                <button
                  onClick={onClose}
                  className="bg-red-500/15 hover:bg-red-500/25 text-red-400 font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
