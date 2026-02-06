import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/auth/me - Retorna informações do usuário logado
export async function GET() {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json({ user: null })
    }

    // Buscar mais dados do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuperUser: true,
        departments: {
          select: {
            department: {
              select: {
                name: true,
                code: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isSuperUser: user.isSuperUser,
        departments: user.departments.map(d => ({
          name: d.department.name,
          code: d.department.code
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ user: null })
  }
}
