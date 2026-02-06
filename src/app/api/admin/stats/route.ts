import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [videoCount, playlistCount, userCount] = await Promise.all([
      prisma.video.count(),
      prisma.playlist.count(),
      prisma.user.count()
    ])

    return NextResponse.json({
      activeVideos: videoCount,
      totalPlaylists: playlistCount,
      totalUsers: userCount,
      // For now, completion rate is hardcoded until we implement tracking logic
      completionRate: 0 
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
