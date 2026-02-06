import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/videos - Lista vídeos disponíveis para o usuário
export async function GET(request: NextRequest) {
  try {
    const userAuth = await getAuthUser()

    const isAdmin = userAuth?.isSuperUser || userAuth?.role === 'ADMIN'

    const where: any = {
      isPublished: true,
    }

    if (!isAdmin) {
      // Regras estritas para não-admins
      if (!userAuth) {
        // Deslogado: APENAS o que não tem restrição e nem atribuição individual
        where.AND = [
          { access: { none: {} } },
          { assignedUsers: { none: {} } }
        ]
      } else {
        // Logado (não-admin): Público OU depto OU atribuição individual
        where.OR = [
          {
            AND: [
              { access: { none: {} } },
              { assignedUsers: { none: {} } }
            ]
          },
          {
            access: {
              some: {
                department: {
                  code: { in: userAuth.departments }
                }
              }
            }
          },
          {
            assignedUsers: {
              some: {
                userId: userAuth.userId
              }
            }
          }
        ]
      }
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        questions: {
          select: { id: true }
        },
        ...(userAuth ? {
          progress: {
            where: {
              userId: userAuth.userId
            }
          }
        } : {})
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transformar para incluir progresso simplificado
    const videosWithProgress = videos.map((video: any) => {
      const progress = video.progress?.[0] || null
      const { progress: _, ...rest } = video
      return {
        ...rest,
        userProgress: progress
      }
    })

    return NextResponse.json(videosWithProgress)
  } catch (error: any) {
    console.error('CRITICAL ERROR FETCHING VIDEOS:', error)
    if (error.message) console.error('Error message:', error.message)
    if (error.code) console.error('Error code:', error.code)
    
    return NextResponse.json(
      { error: 'Erro ao buscar vídeos', details: error.message },
      { status: 500 }
    )
  }
}
