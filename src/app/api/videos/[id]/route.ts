import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userAuth = await getAuthUser()
    const isAdmin = userAuth?.isSuperUser || userAuth?.role === 'ADMIN'

    // Buscar o vídeo com suas relações de acesso
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        access: {
          include: {
            department: true
          }
        },
        assignedUsers: {
          include: {
            user: true
          }
        },
        questions: {
          include: {
            options: true
          }
        },
        progress: userAuth ? {
          where: {
            userId: userAuth.userId
          }
        } : false
      }
    })

    if (!video || !video.isPublished) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
    }

    // Se não for admin, verificar permissões
    if (!isAdmin) {
      const hasRestrictedAccess = video.access.length > 0
      const hasUserAssignment = video.assignedUsers.length > 0

      if (hasRestrictedAccess || hasUserAssignment) {
        if (!userAuth) {
          return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }

        const userDepts = userAuth.departments || []
        const isFromAllowedDept = video.access.some(a => userDepts.includes(a.department.code))
        const isDirectlyAssigned = video.assignedUsers.some(au => au.userId === userAuth.userId)

        if (!isFromAllowedDept && !isDirectlyAssigned) {
          return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
        }
      }
    }

    // Formatar resposta
    const progress = video.progress?.[0] || null
    const { progress: _, ...rest } = video as any

    return NextResponse.json({
      ...rest,
      userProgress: progress
    })
  } catch (error) {
    console.error('Error fetching individual video:', error)
    return NextResponse.json({ error: 'Erro ao buscar vídeo' }, { status: 500 })
  }
}
