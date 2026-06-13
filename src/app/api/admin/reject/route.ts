import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { reservation_id, admin_notes } = await request.json()

    if (!reservation_id) {
      return NextResponse.json({ error: 'reservation_id es requerido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Obtener reserva
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select(
        `
        id, status,
        reservation_numbers (raffle_numbers (id))
      `
      )
      .eq('id', reservation_id)
      .single()

    if (fetchError || !reservation) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    if (['confirmed', 'rejected', 'expired'].includes(reservation.status)) {
      return NextResponse.json(
        { error: `No se puede rechazar una reserva en estado "${reservation.status}"` },
        { status: 409 }
      )
    }

    const numberRows = (reservation.reservation_numbers ?? []) as Array<{
      raffle_numbers: { id: string } | null
    }>
    const numberIds = numberRows.map((rn) => rn.raffle_numbers?.id).filter(Boolean) as string[]

    // Actualizar estado de la reserva
    await supabase
      .from('reservations')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        admin_notes: admin_notes ?? null,
      })
      .eq('id', reservation_id)

    // Liberar los números → available
    if (numberIds.length) {
      await supabase
        .from('raffle_numbers')
        .update({ status: 'available' })
        .in('id', numberIds)
    }

    await supabase.from('notification_log').insert({
      type: 'payment_rejected',
      reservation_id,
      success: true,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/admin/reject]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
