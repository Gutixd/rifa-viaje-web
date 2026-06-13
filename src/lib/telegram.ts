const TELEGRAM_API_BASE = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegramMessage(message: string): Promise<boolean> {
  const chatId = process.env.TELEGRAM_CHAT_ID
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!chatId || !botToken) {
    console.warn('[Telegram] Bot token o chat ID no configurados.')
    return false
  }

  try {
    const res = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[Telegram] Error al enviar mensaje:', err)
    return false
  }
}

export function buildReservationMessage(opts: {
  reservationId: string
  buyerName: string
  buyerPhone: string
  buyerEmail: string
  numbers: number[]
  totalAmount: number
  paymentMethod: 'transfer' | 'cash'
  comments?: string
}): string {
  const {
    reservationId,
    buyerName,
    buyerPhone,
    buyerEmail,
    numbers,
    totalAmount,
    paymentMethod,
    comments,
  } = opts

  const methodTag =
    paymentMethod === 'transfer'
      ? '💸 <b>TRANSFERENCIA</b>'
      : '💵 <b>EFECTIVO</b> ⚠️'

  const methodNote =
    paymentMethod === 'cash'
      ? '\n🔴 <i>Pago en efectivo — requiere coordinación manual</i>'
      : '\n📋 <i>Revisar comprobante de transferencia</i>'

  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/admin`

  return `🎟️ <b>NUEVA RESERVA — RIFA 2026</b>

${methodTag}${methodNote}

👤 <b>Nombre:</b> ${buyerName}
📱 <b>Teléfono:</b> ${buyerPhone}
📧 <b>Correo:</b> ${buyerEmail}${comments ? `\n💬 <b>Nota:</b> ${comments}` : ''}

🔢 <b>Números:</b> ${numbers.join(', ')}
💰 <b>Total:</b> $${totalAmount.toLocaleString('es-CL')}

🆔 <code>${reservationId.slice(0, 8).toUpperCase()}</code>
⏱️ Expira en <b>10 minutos</b>

👉 <a href="${adminUrl}">Abrir Panel Admin</a>`
}

export function buildConfirmMessage(opts: {
  reservationId: string
  buyerName: string
  numbers: number[]
  totalAmount: number
}): string {
  return `✅ <b>PAGO CONFIRMADO — RIFA 2026</b>

👤 ${opts.buyerName}
🔢 Números: ${opts.numbers.join(', ')}
💰 $${opts.totalAmount.toLocaleString('es-CL')}
🆔 <code>${opts.reservationId.slice(0, 8).toUpperCase()}</code>`
}
