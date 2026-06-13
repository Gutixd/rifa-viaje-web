import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { sendTelegramMessage, buildConfirmMessage } from '@/lib/telegram'

export async function POST(request: NextRequest) {
  try {
    const { reservation_id, admin_notes } = await request.json()

    if (!reservation_id) {
      return NextResponse.json({ error: 'reservation_id es requerido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Obtener reserva con datos del comprador y números
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select(
        `
        id, status, total_amount,
        buyers (full_name),
        reservation_numbers (raffle_numbers (id, number))
      `
      )
      .eq('id', reservation_id)
      .single()

    if (fetchError || !reservation) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    if (!['pending', 'pending_cash'].includes(reservation.status)) {
      return NextResponse.json(
        { error: `No se puede confirmar una reserva en estado "${reservation.status}"` },
        { status: 409 }
      )
    }

    // Extraer IDs y números
    const numberRows = (reservation.reservation_numbers ?? []) as unknown as Array<{
      raffle_numbers: { id: string; number: number } | null
    }>
    const numberIds = numberRows.map((rn) => rn.raffle_numbers?.id).filter(Boolean) as string[]
    const numbers = numberRows.map((rn) => rn.raffle_numbers?.number).filter(Boolean) as number[]

    // Actualizar estado de la reserva
    const { error: resError } = await supabase
      .from('reservations')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        admin_notes: admin_notes ?? null,
      })
      .eq('id', reservation_id)

    if (resError) {
      return NextResponse.json({ error: resError.message }, { status: 500 })
    }

    // Marcar números como vendidos
    if (numberIds.length) {
      await supabase
        .from('raffle_numbers')
        .update({ status: 'sold' })
        .in('id', numberIds)
    }

    // Notificación Telegram
    const buyer = reservation.buyers as { full_name: string } | null
    const tgMsg = buildConfirmMessage({
      reservationId: reservation_id,
      buyerName: buyer?.full_name ?? 'Desconocido',
      numbers: numbers.sort((a, b) => a - b),
      totalAmount: reservation.total_amount,
    })
    const tgOk = await sendTelegramMessage(tgMsg)

    await supabase.from('notification_log').insert({
      type: 'payment_confirmed',
      reservation_id,
      success: tgOk,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/admin/confirm]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
