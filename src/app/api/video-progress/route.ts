import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/video-progress - Check progress for a specific video
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      // Guest users have no progress
      return NextResponse.json({ watchedFully: false, quizCompleted: false })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'videoId é obrigatório' }, { status: 400 })
    }

    const progress = await prisma.videoProgress.findUnique({
      where: {
        userId_videoId: {
          userId: user.userId,
          videoId
        }
      }
    })

    return NextResponse.json(progress || { watchedFully: false, quizCompleted: false })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/video-progress - Update or create progress
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      // Guests cannot save progress, but we shouldn't crash
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { videoId, watchedFully, quizCompleted, quizScore } = body

    if (!videoId) {
      return NextResponse.json({ error: 'videoId é obrigatório' }, { status: 400 })
    }

    const now = new Date()
    const isCompleted = watchedFully && quizCompleted

    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: user.userId,
          videoId
        }
      },
      update: {
        watchedFully: watchedFully ?? undefined,
        quizCompleted: quizCompleted ?? undefined,
        quizScore: quizScore !== undefined ? quizScore : undefined,
        completedAt: isCompleted ? now : undefined,
        updatedAt: now
      },
      create: {
        userId: user.userId,
        videoId,
        watchedFully: watchedFully ?? false,
        quizCompleted: quizCompleted ?? false,
        quizScore: quizScore || 0,
        completedAt: isCompleted ? now : null
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json({ error: 'Erro ao atualizar progresso' }, { status: 500 })
  }
}
