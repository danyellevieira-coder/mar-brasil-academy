import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/videos/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        questions: {
          include: {
            options: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar vídeo' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/videos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    console.log(`[API] PUT /api/admin/videos/${id} - Iniciando atualização`)

    const body = await request.json()
    console.log('[API] Body recebido (tamanho thumbnail):', body.thumbnail?.length || 0)

    const { title, description, youtubeUrl, thumbnail, duration, departmentIds, userIds, isPublished, requiresCompletion } = body

    console.log('[API] Limpando acessos antigos...')
    // Deletar acessos antigos e criar novos
    await prisma.videoAccess.deleteMany({
      where: { videoId: id }
    })

    await prisma.videoUserAccess.deleteMany({
      where: { videoId: id }
    })

    console.log('[API] Atualizando registro no Prisma...')
    const video = await prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        youtubeUrl,
        thumbnail,
        duration,
        isPublished,
        requiresCompletion,
        ...(departmentIds && {
          access: {
            create: departmentIds.map((deptId: string) => ({
              departmentId: deptId
            }))
          }
        }),
        ...(userIds && {
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

    console.log('[API] Vídeo atualizado com sucesso:', id)
    return NextResponse.json(video)
  } catch (error: any) {
    console.error(`[API] Erro CRÍTICO ao atualizar vídeo ${id}:`, error)
    return NextResponse.json(
      { error: `Erro ao atualizar vídeo: ${error.message || 'Erro interno'}` },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/videos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Vídeo excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir vídeo' },
      { status: 500 }
    )
  }
}
