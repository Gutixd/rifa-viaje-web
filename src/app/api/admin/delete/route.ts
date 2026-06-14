import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { reservation_id } = await request.json()

    if (!reservation_id) {
      return NextResponse.json({ error: 'reservation_id es requerido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get reservation and its number IDs
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select(`
        id, status,
        reservation_numbers (raffle_numbers (id))
      `)
      .eq('id', reservation_id)
      .single()

    if (fetchError || !reservation) {
      return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })
    }

    const numberRows = (reservation.reservation_numbers ?? []) as unknown as Array<{
      raffle_numbers: { id: string } | null
    }>
    const numberIds = numberRows.map((rn) => rn.raffle_numbers?.id).filter(Boolean) as string[]

    // Return numbers to available if they were active (not already freed)
    if (numberIds.length && ['pending', 'pending_cash', 'confirmed'].includes(reservation.status)) {
      await supabase
        .from('raffle_numbers')
        .update({ status: 'available' })
        .in('id', numberIds)
    }

    // Remove notification_log references (no CASCADE on this FK)
    await supabase
      .from('notification_log')
      .delete()
      .eq('reservation_id', reservation_id)

    // Delete reservation — CASCADE handles reservation_numbers
    const { error: deleteError } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservation_id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[/api/admin/delete]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
