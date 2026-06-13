import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredReservations } from '@/lib/cleanup'

export const dynamic = 'force-dynamic'

// Vercel cron llama con GET, también acepta POST para llamadas manuales
export async function GET(request: NextRequest) {
  return handle(request)
}

export async function POST(request: NextRequest) {
  return handle(request)
}

async function handle(request: NextRequest) {
  // Verificar secreto del cron si está configurado
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
  }

  const cleaned = await cleanupExpiredReservations()
  return NextResponse.json({ cleaned, timestamp: new Date().toISOString() })
}
