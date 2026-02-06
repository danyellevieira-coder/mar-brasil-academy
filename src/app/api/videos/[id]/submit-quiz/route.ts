import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

interface AnswerInput {
  [questionId: string]: string  // optionId for multiple choice, text for text questions
}

// POST /api/videos/[id]/submit-quiz - Submit quiz answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { answers } = body as { answers: AnswerInput }

    // Get video with questions and correct answers
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true
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

    // Calculate score
    let correct = 0
    const total = video.questions.filter((q: any) => q.type === 'MULTIPLE_CHOICE').length

    for (const question of video.questions) {
      if (question.type === 'MULTIPLE_CHOICE') {
        const userAnswer = answers[question.id]
        const correctOption = question.options.find((o: any) => o.isCorrect)
        if (correctOption && userAnswer === correctOption.id) {
          correct++
        }
      }
      // Text questions are not auto-graded
    }

    // Save progress to database
    const userAuth = await getAuthUser()
    if (userAuth) {
      const score = total > 0 ? Math.round((correct / total) * 100) : 100
      const passed = total === 0 || correct >= total * 0.7

      await prisma.videoProgress.upsert({
        where: {
          userId_videoId: {
            userId: userAuth.userId,
            videoId: id
          }
        },
        update: {
          quizCompleted: passed,
          quizScore: score,
          completedAt: passed ? new Date() : undefined,
          updatedAt: new Date()
        },
        create: {
          userId: userAuth.userId,
          videoId: id,
          watchedFully: true,
          quizCompleted: passed,
          quizScore: score,
          completedAt: passed ? new Date() : null
        }
      })
    }

    return NextResponse.json({
      correct,
      total,
      passed: total === 0 || correct >= total * 0.7  // 70% to pass
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar quiz' },
      { status: 500 }
    )
  }
}
