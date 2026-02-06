import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// POST /api/auth/signout - Logout user
export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Clear the auth token cookie
    cookieStore.delete('auth-token')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error signing out:', error)
    return NextResponse.json({ error: 'Erro ao sair' }, { status: 500 })
  }
}
