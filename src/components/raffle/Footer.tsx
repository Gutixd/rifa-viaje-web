import { RAFFLE_CONFIG } from '@/config/raffle'

export default function Footer() {
  return (
    <footer className="border-t border-surface-700 mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="font-display font-semibold text-white text-sm">
            {RAFFLE_CONFIG.name}
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            Cierre: 10 de agosto de 2026
          </p>
        </div>

        <div className="text-center text-xs text-white/30 space-y-1">
          <p>Contacto: {RAFFLE_CONFIG.organizerContact}</p>
          <p>Los pagos son confirmados manualmente por el organizador.</p>
        </div>

        <a
          href="/admin"
          className="text-xs text-white/20 hover:text-white/40 transition-colors"
        >
          Admin
        </a>
      </div>
    </footer>
  )
}
