import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Test basic connection
    const userCount = await prisma.user.count()
    
    // 2. Test schema (check if isSuperUser column is accessible)
    // We try to find one user and select the specific field
    const sampleUser = await prisma.user.findFirst({
      select: { id: true, isSuperUser: true }
    })

    return NextResponse.json({ 
      status: 'ok', 
      userCount, 
      sampleUser,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL
      }
    })
  } catch (error: any) {
    console.error('DB Test Error:', error)
    return NextResponse.json({ 
      status: 'error', 
      message: error.message, 
      code: error.code,
      meta: error.meta,
      stack: error.stack 
    }, { status: 500 })
  }
}
