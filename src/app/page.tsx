import { createServerClient } from '@/lib/supabase/server'
import { cleanupExpiredReservations } from '@/lib/cleanup'
import HeroSection from '@/components/raffle/HeroSection'
import PrizesSection from '@/components/raffle/PrizesSection'
import NumberGrid from '@/components/raffle/NumberGrid'
import HowItWorks from '@/components/raffle/HowItWorks'
import Footer from '@/components/raffle/Footer'
import type { RaffleNumber } from '@/types'

async function getInitialNumbers(): Promise<RaffleNumber[]> {
  try {
    await cleanupExpiredReservations()
    const supabase = createServerClient()
    const { data } = await supabase
      .from('raffle_numbers')
      .select('id, number, status, updated_at')
      .order('number', { ascending: true })
    return (data as RaffleNumber[]) ?? []
  } catch (err) {
    console.error('[page] Failed to fetch numbers:', err)
    return []
  }
}

export default async function Home() {
  const initialNumbers = await getInitialNumbers()

  return (
    <main className="min-h-screen bg-[#05050f]">
      <HeroSection />
      <HowItWorks />
      <PrizesSection />
      <NumberGrid initialNumbers={initialNumbers} />
      <Footer />
    </main>
  )
}
