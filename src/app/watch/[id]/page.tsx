'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import YouTubePlayer from '@/components/player/YouTubePlayer'

interface QuestionOption {
  id: string
  text: string
  order: number
}

interface Question {
  id: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'TEXT'
  order: number
  options: QuestionOption[]
}

interface Video {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  requiresCompletion: boolean
  questions: Question[]
}

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [quizResult, setQuizResult] = useState<{ correct: number; total: number; passed: boolean } | null>(null)
  const [progress, setProgress] = useState<{ watchedFully: boolean; quizCompleted: boolean } | null>(null)
  const [videoEnded, setVideoEnded] = useState(false)

  useEffect(() => {
    fetchVideo()
    fetchProgress()
  }, [id])

  const fetchProgress = async () => {
    // ... existing code
  }

  const fetchVideo = async () => {
    try {
      const res = await fetch(`/api/videos/${id}`)
      if (res.status === 403) {
        setError('Você não tem permissão para acessar este conteúdo.')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error('Video not found')
      const data = await res.json()
      setVideo(data)
    } catch (error) {
      console.error('Error fetching video:', error)
      setError('Vídeo não encontrado ou erro de conexão.')
    } finally {
      setLoading(false)
    }
  }

  const extractYoutubeId = (url: string): string | null => {
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

  const handleVideoEnd = async () => {
    setVideoEnded(true)
    // Save progress that video was watched
    try {
      await fetch('/api/video-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: id,
          watchedFully: true
        })
      })
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleComplete = async () => {
    if (!video) return
    
    if (video.questions.length > 0) {
      // Has quiz - go to quiz
      setShowQuiz(true)
    } else {
      // No quiz - mark as complete
      try {
        await fetch('/api/video-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: id,
            watchedFully: true,
            quizCompleted: true
          })
        })
      } catch (error) {
        console.error('Error updating progress:', error)
      }
      setQuizComplete(true)
    }
  }

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNextQuestion = () => {
    if (video && currentQuestion < video.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Submit quiz
      submitQuiz()
    }
  }

  const submitQuiz = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/videos/${id}/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      })
      const result = await res.json()
      setQuizResult(result)
      setQuizComplete(true)
    } catch (error) {
      console.error('Error submitting quiz:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetryQuiz = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setQuizResult(null)
    setQuizComplete(false)
    setSubmitting(false)
    setShowQuiz(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--accent)] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!video || error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-[var(--foreground-muted)] mb-8">
            {error || 'Não foi possível carregar o vídeo solicitado.'}
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all border border-white/10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao Início
          </Link>
        </div>
      </div>
    )
  }

  const youtubeId = extractYoutubeId(video.youtubeUrl)
  const currentQ = video.questions[currentQuestion]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--surface)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-[var(--foreground-muted)] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-white font-semibold truncate">{video.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className={video.requiresCompletion ? 'pb-24' : ''}>
        {/* Video Player - Full Width */}
        {youtubeId && !showQuiz && !quizComplete && (
          <div className="w-full">
            <YouTubePlayer
              videoId={youtubeId}
              onVideoEnd={handleVideoEnd}
            />
          </div>
        )}

        {/* Completion Button - Fixed at bottom */}
        {!showQuiz && !quizComplete && video.requiresCompletion && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-t border-[var(--border)] p-4">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                {videoEnded || progress?.watchedFully ? (
                  <div className="w-10 h-10 min-w-[2.5rem] bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-10 h-10 min-w-[2.5rem] bg-[var(--border)] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-white font-medium text-sm md:text-base">
                    {videoEnded || progress?.watchedFully ? 'Vídeo assistido' : 'Assista o vídeo completo'}
                  </p>
                  <p className="text-[var(--foreground-muted)] text-xs md:text-sm">
                    {video.questions.length > 0 
                      ? `${video.questions.length} pergunta${video.questions.length > 1 ? 's' : ''} ao final`
                      : 'Clique para marcar como concluído'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleComplete}
                // DEBUG: disabled removed for testing - uncomment for production
                // disabled={!videoEnded && !progress?.watchedFully}
                className={`w-full md:w-auto px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white hover:opacity-90`}
              >
                {video.questions.length > 0 ? (
                  <>
                    Ir para perguntas
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>
                ) : (
                  <>
                    Marcar como concluído
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}


        {/* Quiz Modal */}
        {showQuiz && !quizComplete && currentQ && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-8 md:p-10 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[var(--foreground-muted)] text-sm">Pergunta {currentQuestion + 1} de {video.questions.length}</span>
              <div className="flex-1 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] transition-all"
                  style={{ width: `${((currentQuestion + 1) / video.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-6">{currentQ.text}</h3>

            {/* Options */}
            {currentQ.type === 'MULTIPLE_CHOICE' ? (
              <div className="space-y-3 mb-8">
                {currentQ.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(currentQ.id, option.id)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      answers[currentQ.id] === option.id
                        ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]'
                        : 'bg-[var(--surface-elevated)]/50 border-[var(--border)] text-[var(--foreground-secondary)] hover:border-[var(--foreground-muted)]'
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={answers[currentQ.id] || ''}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                placeholder="Digite sua resposta..."
                rows={4}
                className="w-full px-4 py-3 bg-[var(--surface-elevated)]/50 border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none mb-8"
              />
            )}

            {/* Actions */}
            <button
              onClick={handleNextQuestion}
              disabled={!answers[currentQ.id] || submitting}
              className="w-full py-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Enviando...
                </>
              ) : currentQuestion < video.questions.length - 1 ? (
                <>
                  Próxima Pergunta
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              ) : (
                'Finalizar Quiz'
              )}
            </button>
          </div>
          </div>
        )}

        {/* Quiz Complete */}
        {quizComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`bg-[var(--surface)] border-2 ${quizResult?.passed || video.questions.length === 0 ? 'border-emerald-500/50' : 'border-red-500/50'} rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300`}>
              <div className={`w-24 h-24 ${quizResult?.passed || video.questions.length === 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                {quizResult?.passed || video.questions.length === 0 ? (
                  <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {video.questions.length === 0 ? 'Vídeo Concluído!' : (quizResult?.passed ? 'Aprovado!' : 'Precisa Melhorar')}
              </h2>
              
              <p className="text-lg text-[var(--foreground-muted)] mb-8">
                {video.questions.length === 0
                  ? 'Você completou este conteúdo com sucesso.'
                  : (quizResult?.passed 
                    ? 'Parabéns! Você demonstrou domínio sobre o conteúdo.' 
                    : 'Você não atingiu a pontuação mínima de 70%. Assista o vídeo novamente e tente de novo.')
                }
              </p>

              {quizResult && (
                <div className="bg-[var(--surface-elevated)] rounded-2xl p-6 mb-8 border border-[var(--border)]">
                  <div className="text-sm text-[var(--foreground-muted)] mb-1 uppercase tracking-wide font-bold">Sua Pontuação</div>
                  <div className={`text-4xl font-black ${quizResult.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                    {Math.round((quizResult.correct / quizResult.total) * 100)}%
                  </div>
                  <div className="text-sm text-[var(--foreground-muted)] mt-1">
                    {quizResult.correct} de {quizResult.total} acertos
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="w-full py-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Voltar ao Dashboard
                </Link>
                
                {video.questions.length > 0 && !quizResult?.passed && (
                  <button
                    onClick={handleRetryQuiz}
                    className="w-full py-3 md:py-4 bg-[var(--surface-elevated)] text-[var(--foreground)] font-semibold rounded-xl hover:bg-[var(--border)] transition-all border border-[var(--border)]"
                  >
                    Tentar Novamente
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
