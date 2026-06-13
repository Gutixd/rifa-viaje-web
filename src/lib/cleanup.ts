import { createServerClient } from './supabase/server'

export async function cleanupExpiredReservations(): Promise<number> {
  try {
    const supabase = createServerClient()

    // Find expired reservations
    const { data: expired, error } = await supabase
      .from('reservations')
      .select('id')
      .in('status', ['pending', 'pending_cash'])
      .lt('expires_at', new Date().toISOString())

    if (error || !expired?.length) return 0

    const expiredIds = expired.map((r) => r.id)

    // Get number IDs associated with these reservations
    const { data: numRows } = await supabase
      .from('reservation_numbers')
      .select('number_id')
      .in('reservation_id', expiredIds)

    if (numRows?.length) {
      const numberIds = numRows.map((n) => n.number_id)
      await supabase
        .from('raffle_numbers')
        .update({ status: 'available' })
        .in('id', numberIds)
    }

    // Mark reservations as expired
    await supabase
      .from('reservations')
      .update({ status: 'expired' })
      .in('id', expiredIds)

    return expiredIds.length
  } catch (err) {
    console.error('[Cleanup] Error:', err)
    return 0
  }
}
