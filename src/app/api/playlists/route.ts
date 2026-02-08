import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/playlists - Lista playlists que o usuário pode ver
export async function GET(request: NextRequest) {
  try {
    const userAuth = await getAuthUser()

    // Se for admin ou superuser, não aplica filtros de departamento (vê tudo)
    const isAdmin = userAuth?.isSuperUser || userAuth?.role === 'ADMIN'

    const where: any = {
      isPublished: true,
    }

    if (!isAdmin) {
      // Regras estritas para não-admins
      if (!userAuth) {
        // Deslogado: VER o que não tem depto OU o que tem o depto público (MARBR)
        where.OR = [
          { access: { none: {} } },
          { access: { some: { department: { code: 'MARBR' } } } }
        ]
      } else {
        // Logado (não-admin): VER o que é público OU o que é do seu depto
        where.OR = [
          { access: { none: {} } },
          { access: { some: { department: { code: 'MARBR' } } } },
          {
            access: {
              some: {
                department: {
                  code: { in: userAuth.departments }
                }
              }
            }
          }
        ]
      }
    }

    const playlists = await prisma.playlist.findMany({
      where,
      include: {
        videos: {
          include: {
            video: {
              select: {
                id: true,
                title: true,
                description: true,
                thumbnail: true,
                isPublished: true,
                questions: {
                  select: { id: true }
                },
                progress: userAuth ? {
                  where: { userId: userAuth.userId },
                  select: { watchedFully: true, quizCompleted: true, quizScore: true }
                } : false
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        },
        access: {
          include: {
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Filtrar apenas vídeos publicados e formatar resposta
    const formattedPlaylists = (playlists as any[]).map(playlist => ({
      id: playlist.id,
      title: playlist.title,
      description: playlist.description,
      thumbnail: playlist.thumbnail,
      access: playlist.access.map((a: any) => ({
        name: a.department.name,
        code: a.department.code
      })),
      videos: playlist.videos
        .filter((pv: any) => pv.video.isPublished)
        .map((pv: any) => ({
          id: pv.video.id,
          title: pv.video.title,
          description: pv.video.description,
          thumbnail: pv.video.thumbnail,
          hasQuiz: pv.video.questions.length > 0,
          userProgress: pv.video.progress?.[0] || null
        }))
    }))
      .filter(p => p.videos.length > 0) // Só mostra playlists com vídeos

    return NextResponse.json(formattedPlaylists)
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar playlists' },
      { status: 500 }
    )
  }
}
