export type NumberStatus = 'available' | 'reserved' | 'sold'
export type PaymentMethod = 'transfer' | 'cash'
export type ReservationStatus =
  | 'pending'
  | 'pending_cash'
  | 'confirmed'
  | 'rejected'
  | 'expired'

export interface RaffleNumber {
  id: string
  number: number
  status: NumberStatus
  updated_at: string
}

export interface Buyer {
  id: string
  full_name: string
  phone: string
  email: string
  comments?: string
  created_at: string
}

export interface Reservation {
  id: string
  buyer_id: string
  buyer?: Buyer
  status: ReservationStatus
  payment_method: PaymentMethod
  total_amount: number
  expires_at: string
  confirmed_at?: string
  rejected_at?: string
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface ReservationWithDetails extends Reservation {
  buyer: Buyer
  numbers: number[]
}

export interface ReserveRequest {
  numbers: number[]
  full_name: string
  phone: string
  email: string
  payment_method: PaymentMethod
  comments?: string
}

export interface AdminStats {
  total: number
  available: number
  reserved: number
  sold: number
  total_revenue: number
  pending_count: number
  pending_cash_count: number
}
