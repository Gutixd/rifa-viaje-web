import { cookies } from 'next/headers'

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const secret = process.env.ADMIN_SESSION_SECRET
  return !!(secret && session?.value === secret)
}
