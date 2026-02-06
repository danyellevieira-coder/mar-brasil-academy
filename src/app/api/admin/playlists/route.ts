import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/playlists - Lista todas as playlists
export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        videos: {
          include: {
            video: true
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

    return NextResponse.json(playlists)
  } catch (error) {
    console.error('Error fetching playlists:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar playlists' },
      { status: 500 }
    )
  }
}

// POST /api/admin/playlists - Criar nova playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, thumbnail, isPublished, videoIds, departmentIds } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    const playlist = await prisma.playlist.create({
      data: {
        title,
        description,
        thumbnail,
        isPublished: isPublished ?? false,
        ...(videoIds && videoIds.length > 0 && {
          videos: {
            create: videoIds.map((videoId: string, index: number) => ({
              videoId,
              order: index
            }))
          }
        }),
        ...(departmentIds && departmentIds.length > 0 && {
          access: {
            create: departmentIds.map((deptId: string) => ({
              departmentId: deptId
            }))
          }
        })
      },
      include: {
        videos: {
          include: {
            video: true
          }
        },
        access: {
          include: {
            department: true
          }
        }
      }
    })

    return NextResponse.json(playlist, { status: 201 })
  } catch (error) {
    console.error('Error creating playlist:', error)
    return NextResponse.json(
      { error: 'Erro ao criar playlist' },
      { status: 500 }
    )
  }
}
