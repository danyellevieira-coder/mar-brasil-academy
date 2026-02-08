import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/videos - Lista todos os vídeos
export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      include: {
        access: {
          include: {
            department: true
          }
        },
        questions: true,
        _count: {
          select: {
            progress: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar vídeos' },
      { status: 500 }
    )
  }
}

// POST /api/admin/videos - Criar novo vídeo
export async function POST(request: NextRequest) {
  try {
    console.log('[API] POST /api/admin/videos - Iniciando criação de vídeo')
    const body = await request.json()
    console.log('[API] Body recebido (tamanho title):', body.title?.length)

    const { title, description, youtubeUrl, thumbnail, duration, departmentIds, userIds, isPublished, requiresCompletion } = body

    if (!title || !youtubeUrl) {
      console.warn('[API] Falha de validação: Título ou URL ausente')
      return NextResponse.json(
        { error: 'Título e URL do YouTube são obrigatórios' },
        { status: 400 }
      )
    }

    // Extrair ID do vídeo do YouTube
    const youtubeId = extractYoutubeId(youtubeUrl)
    if (!youtubeId) {
      console.warn('[API] URL do YouTube inválida:', youtubeUrl)
      return NextResponse.json(
        { error: 'URL do YouTube inválida' },
        { status: 400 }
      )
    }

    console.log('[API] Tentando prisma.video.create...')
    const video = await prisma.video.create({
      data: {
        title,
        description,
        youtubeUrl,
        thumbnail: thumbnail || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
        duration,
        isPublished: isPublished ?? false,
        requiresCompletion: requiresCompletion ?? true,
        ...(departmentIds && departmentIds.length > 0 && {
          access: {
            create: departmentIds.map((deptId: string) => ({
              departmentId: deptId
            }))
          }
        }),
        ...(userIds && userIds.length > 0 && {
          assignedUsers: {
            create: userIds.map((userId: string) => ({
              userId: userId
            }))
          }
        })
      },
      include: {
        access: {
          include: {
            department: true
          }
        },
        assignedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    console.log('[API] Vídeo criado com sucesso:', video.id)
    return NextResponse.json(video, { status: 201 })
  } catch (error: any) {
    console.error('[API] Erro CRÍTICO ao criar vídeo:', error)
    // Log details if it's a Prisma error
    if (error.code) console.error('[API] Prisma Error Code:', error.code)

    return NextResponse.json(
      { error: `Erro ao criar vídeo: ${error.message || 'Erro interno'}` },
      { status: 500 }
    )
  }
}

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}
