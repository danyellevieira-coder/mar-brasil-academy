import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface QuestionInput {
  text: string
  type: 'MULTIPLE_CHOICE' | 'TEXT_INPUT'
  order: number
  options: { text: string; isCorrect: boolean }[]
}

// POST /api/admin/videos/[id]/quiz - Create/Update quiz questions
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { questions, publish } = body as { questions: QuestionInput[]; publish?: boolean }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Vídeo não encontrado' },
        { status: 404 }
      )
    }

    // Delete existing questions (cascade deletes options)
    await prisma.quizQuestion.deleteMany({
      where: { videoId: id }
    })

    // Create new questions (only if there are any)
    if (questions && questions.length > 0) {
      for (const q of questions) {
        await prisma.quizQuestion.create({
          data: {
            videoId: id,
            text: q.text,
            type: q.type === 'TEXT_INPUT' ? 'TEXT_INPUT' : 'MULTIPLE_CHOICE',
            order: q.order,
            options: {
              create: q.options.map((o, i) => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }
        })
      }
    }

    // Publish video if requested
    if (publish) {
      await prisma.video.update({
        where: { id },
        data: { isPublished: true }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving quiz:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar quiz' },
      { status: 500 }
    )
  }
}
