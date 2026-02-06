import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// GET /api/admin/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const { password, departments, ...restUser } = user
    return NextResponse.json({
      ...restUser,
      department: departments.length > 0 ? departments[0].department : null
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuário' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, password, role, departmentId, isSuperUser } = body

    // Check if email is used by another user
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id } }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Email já cadastrado por outro usuário' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {
      name,
      email,
      role,
      isSuperUser: isSuperUser || false
    }

    // Only update password if provided
    if (password) {
      updateData.password = await hashPassword(password)
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Update department if provided
    if (departmentId !== undefined) {
      // Remove existing department relations
      await prisma.userDepartment.deleteMany({
        where: { userId: id }
      })

      // Add new department if provided
      if (departmentId) {
        await prisma.userDepartment.create({
          data: { userId: id, departmentId }
        })
      }
    }

    // Fetch updated user with departments
    const updatedUser = await prisma.user.findUnique({
      where: { id },
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

    if (!updatedUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    const { password: _, departments, ...restUser } = updatedUser
    return NextResponse.json({
      ...restUser,
      department: departments.length > 0 ? departments[0].department : null
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    )
  }
}
