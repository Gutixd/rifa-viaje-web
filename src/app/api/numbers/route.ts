import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { cleanupExpiredReservations } from '@/lib/cleanup'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await cleanupExpiredReservations()

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('raffle_numbers')
      .select('id, number, status, updated_at')
      .order('number', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/numbers]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
