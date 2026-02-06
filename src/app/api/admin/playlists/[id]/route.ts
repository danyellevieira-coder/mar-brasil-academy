import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/playlists/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        videos: {
          include: {
            video: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                isPublished: true
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        access: {
          include: {
            department: true
          }
        }
      }
    })

    if (!playlist) {
      return NextResponse.json(
        { error: 'Playlist não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar playlist' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/playlists/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, isPublished, videoIds, departmentIds } = body

    // Update playlist basic info
    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        title,
        description,
        isPublished
      }
    })

    // Update videos if provided
    if (videoIds !== undefined) {
      // Remove existing video associations
      await prisma.playlistVideo.deleteMany({
        where: { playlistId: id }
      })

      // Create new associations with order
      if (videoIds.length > 0) {
        await prisma.playlistVideo.createMany({
          data: videoIds.map((videoId: string, index: number) => ({
            playlistId: id,
            videoId,
            order: index
          }))
        })
      }
    }

    // Update departments if provided
    if (departmentIds !== undefined) {
      // Remove existing access associations
      await prisma.playlistAccess.deleteMany({
        where: { playlistId: id }
      })

      // Create new associations
      if (departmentIds.length > 0) {
        await prisma.playlistAccess.createMany({
          data: departmentIds.map((deptId: string) => ({
            playlistId: id,
            departmentId: deptId
          }))
        })
      }
    }

    return NextResponse.json(playlist)
  } catch (error) {
    console.error('Error updating playlist:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar playlist' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/playlists/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.playlist.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Playlist excluída com sucesso' })
  } catch (error) {
    console.error('Error deleting playlist:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir playlist' },
      { status: 500 }
    )
  }
}
