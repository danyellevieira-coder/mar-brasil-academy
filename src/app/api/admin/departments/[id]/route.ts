import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/departments/[id] - Atualizar departamento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, code } = body

    if (!name || !code) {
      return NextResponse.json(
        { error: 'Nome e código são obrigatórios' },
        { status: 400 }
      )
    }

    // Check if code is used by another department
    const existing = await prisma.department.findFirst({
      where: { code, NOT: { id } }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Código já está em uso por outro departamento' },
        { status: 400 }
      )
    }

    const department = await prisma.department.update({
      where: { id },
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

    return NextResponse.json(department)
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar departamento' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/departments/[id] - Excluir departamento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if department has users
    const department = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    })

    if (!department) {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      )
    }

    if (department._count.users > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir departamento com usuários vinculados' },
        { status: 400 }
      )
    }

    // Delete video access first
    await prisma.videoAccess.deleteMany({
      where: { departmentId: id }
    })

    await prisma.department.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir departamento' },
      { status: 500 }
    )
  }
}
