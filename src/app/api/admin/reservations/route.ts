import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const supabase = createServerClient()

    let query = supabase
      .from('reservations')
      .select(
        `
        id, status, payment_method, total_amount, expires_at,
        confirmed_at, rejected_at, admin_notes, created_at, updated_at,
        buyers (id, full_name, phone, email, comments),
        reservation_numbers (
          raffle_numbers (number)
        )
      `
      )
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten reservation_numbers
    const formatted = data?.map((r) => ({
      ...r,
      numbers: (r.reservation_numbers as unknown as Array<{ raffle_numbers: { number: number } | null }>)
        ?.map((rn) => rn.raffle_numbers?.number)
        .filter((n): n is number => n !== undefined)
        .sort((a, b) => a - b) ?? [],
      buyer: r.buyers,
    }))

    return NextResponse.json(formatted)
  } catch (err) {
    console.error('[/api/admin/reservations]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
