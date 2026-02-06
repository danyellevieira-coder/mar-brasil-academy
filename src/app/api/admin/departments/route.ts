import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/departments - Lista todos os departamentos
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            videoAccess: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar departamentos' },
      { status: 500 }
    )
  }
}

// POST /api/admin/departments - Criar departamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code } = body

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Nome e código são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.department.findUnique({
      where: { code }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Código já está em uso' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: { name, code },
      include: {
        _count: {
          select: {
            users: true,
            videoAccess: true
          }
        }
      }
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { error: 'Erro ao criar departamento' },
      { status: 500 }
    )
  }
}
