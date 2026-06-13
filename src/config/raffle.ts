// ──────────────────────────────────────────────────────────────────────────────
//  CONFIGURACIÓN PRINCIPAL DE LA RIFA
//  Edita este archivo para personalizar tu rifa sin tocar el código.
// ──────────────────────────────────────────────────────────────────────────────

export const RAFFLE_CONFIG = {
  // Información general
  name: 'Gran Rifa 2026',
  subtitle: '¡Participa y gana increíbles premios!',
  description:
    'Adquiere tus números de la suerte y participa en la rifa del año. Solo 200 números disponibles.',

  // Números
  totalNumbers: 200,
  pricePerNumber: 1000,
  currency: 'CLP',
  currencySymbol: '$',

  // Fecha de cierre (10 de agosto de 2026 a medianoche, zona Chile)
  endDate: new Date('2026-08-10T23:59:59-04:00'),

  // Reserva temporal (minutos)
  reservationMinutes: 10,

  // ── Premios ─────────────────────────────────────────────────────────────────
  // Cambia name y description cuando tengas los premios definidos.
  prizes: [
    {
      rank: 1,
      label: '1° Premio',
      name: 'Premio Principal',
      description: 'Descripción del primer premio. Edita esto en src/config/raffle.ts',
      emoji: '🏆',
      highlight: true,
    },
    {
      rank: 2,
      label: '2° Premio',
      name: 'Premio Secundario',
      description: 'Descripción del segundo premio. Edita esto en src/config/raffle.ts',
      emoji: '🥈',
      highlight: false,
    },
    {
      rank: 3,
      label: '3° Premio',
      name: 'Premio Terciario',
      description: 'Descripción del tercer premio. Edita esto en src/config/raffle.ts',
      emoji: '🥉',
      highlight: false,
    },
  ],

  // ── Datos de transferencia ───────────────────────────────────────────────────
  // Rellena con los datos reales de tu cuenta bancaria.
  transferInfo: {
    bank: 'Banco Estado',
    accountType: 'Cuenta Corriente',
    accountNumber: '000-000000-00',
    rut: '12.345.678-9',
    name: 'Nombre del Titular',
    email: 'pagos@tucorreo.com',
    instructions:
      'Envía el comprobante de transferencia al WhatsApp indicando tu nombre y los números reservados.',
  },

  // ── Pago en efectivo ─────────────────────────────────────────────────────────
  cashInfo: {
    instructions:
      'Nos contactaremos contigo para coordinar el lugar y horario de pago en efectivo. Tienes 10 minutos de reserva.',
    contact: '+56 9 XXXX XXXX',
  },

  // ── Imagen principal ─────────────────────────────────────────────────────────
  // Reemplaza con la URL de tu imagen o pon null para usar el fondo por defecto.
  heroImage: null as string | null,

  // ── Redes sociales (opcional) ─────────────────────────────────────────────────
  social: {
    instagram: '',
    whatsapp: '',
  },

  // ── Contacto ─────────────────────────────────────────────────────────────────
  organizerName: 'Organizador',
  organizerContact: 'contacto@tucorreo.com',
} as const

export type Prize = (typeof RAFFLE_CONFIG.prizes)[number]
