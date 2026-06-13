import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendTelegramMessage, buildReservationMessage } from '@/lib/telegram'
import { RAFFLE_CONFIG } from '@/config/raffle'
import type { ReserveRequest } from '@/types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body: ReserveRequest = await request.json()

    // ── Validación ────────────────────────────────────────────────────────────
    if (!body.numbers?.length || body.numbers.length > RAFFLE_CONFIG.totalNumbers) {
      return NextResponse.json({ error: 'Selección de números inválida' }, { status: 400 })
    }

    for (const n of body.numbers) {
      if (!Number.isInteger(n) || n < 1 || n > RAFFLE_CONFIG.totalNumbers) {
        return NextResponse.json({ error: `Número inválido: ${n}` }, { status: 400 })
      }
    }

    if (!body.full_name?.trim()) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
    }
    if (!body.phone?.trim()) {
      return NextResponse.json({ error: 'El teléfono es requerido' }, { status: 400 })
    }
    if (!EMAIL_RE.test(body.email ?? '')) {
      return NextResponse.json({ error: 'El correo no es válido' }, { status: 400 })
    }
    if (!['transfer', 'cash'].includes(body.payment_method)) {
      return NextResponse.json({ error: 'Método de pago inválido' }, { status: 400 })
    }

    // ── Llamada a la función atómica de Supabase ──────────────────────────────
    const supabase = createServerClient()

    const { data, error } = await supabase.rpc('create_reservation', {
      p_buyer_name: body.full_name.trim(),
      p_buyer_phone: body.phone.trim(),
      p_buyer_email: body.email.trim().toLowerCase(),
      p_buyer_comments: body.comments?.trim() ?? '',
      p_payment_method: body.payment_method,
      p_numbers: body.numbers,
      p_price_per_num: RAFFLE_CONFIG.pricePerNumber,
      p_reserve_mins: RAFFLE_CONFIG.reservationMinutes,
    })

    if (error) {
      console.error('[/api/reserve] RPC error:', error)
      const userMessage = error.message.includes('ya no está disponible')
        ? error.message
        : 'No se pudo completar la reserva. Intenta de nuevo.'
      return NextResponse.json({ error: userMessage }, { status: 409 })
    }

    const result = data as {
      reservation_id: string
      buyer_id: string
      expires_at: string
      total_amount: number
      status: string
    }

    // ── Notificación Telegram ─────────────────────────────────────────────────
    const message = buildReservationMessage({
      reservationId: result.reservation_id,
      buyerName: body.full_name.trim(),
      buyerPhone: body.phone.trim(),
      buyerEmail: body.email.trim(),
      numbers: body.numbers,
      totalAmount: result.total_amount,
      paymentMethod: body.payment_method,
      comments: body.comments,
    })

    const tgSuccess = await sendTelegramMessage(message)

    // Log la notificación
    await supabase.from('notification_log').insert({
      type: 'new_reservation',
      reservation_id: result.reservation_id,
      success: tgSuccess,
      error_message: tgSuccess ? null : 'Telegram no disponible',
    })

    return NextResponse.json({
      reservation_id: result.reservation_id,
      expires_at: result.expires_at,
      total_amount: result.total_amount,
      payment_method: body.payment_method,
    })
  } catch (err) {
    console.error('[/api/reserve]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
