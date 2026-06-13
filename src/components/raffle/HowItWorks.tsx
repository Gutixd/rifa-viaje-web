'use client'

import { motion } from 'framer-motion'

const steps = [
  { icon: '🔢', title: 'Elige tus números', desc: 'Selecciona uno o varios del 1 al 200.' },
  { icon: '📝', title: 'Ingresa tus datos', desc: 'Nombre, teléfono y correo electrónico.' },
  { icon: '💸', title: 'Realiza el pago', desc: 'Por transferencia bancaria o en efectivo.' },
  { icon: '✅', title: '¡Listo!', desc: 'Confirmamos manualmente y quedas inscrito.' },
]

export default function HowItWorks() {
  return (
    <section className="py-16 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-2">
          Cómo participar
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
          Simple, rápido y seguro
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative bg-surface-800 border border-surface-600 rounded-2xl p-5 text-center"
          >
            <div className="absolute -top-3 -left-2 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-xs font-bold text-black">
              {i + 1}
            </div>
            <div className="text-3xl mb-3">{step.icon}</div>
            <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
