import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// GET /api/admin/users - Lista todos os usuários
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        departments: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform and remove password
    const safeUsers = users.map(({ password, departments, ...user }) => ({
      ...user,
      // Get first department for backwards compatibility
      department: departments.length > 0 ? departments[0].department : null,
      departments: departments.map(d => d.department)
    }))

    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Criar usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, departmentId, isSuperUser } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    // Create user with optional department relation
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'WORKER',
        isSuperUser: isSuperUser || false,
        // Create department relation if provided
        ...(departmentId && {
          departments: {
            create: { departmentId }
          }
        })
      },
      include: {
        departments: {
          include: {
            department: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      }
    })

    // Remove password and format response
    const { password: _, departments, ...restUser } = user

    return NextResponse.json({
      ...restUser,
      department: departments.length > 0 ? departments[0].department : null
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}
