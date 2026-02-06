'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  thumbnail: string | null
  questions: Question[]
}

interface Question {
  id: string
  text: string
  type: 'MULTIPLE_CHOICE' | 'TEXT_INPUT'
  order: number
  options: QuestionOption[]
}

interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

interface NewQuestion {
  text: string
  type: 'MULTIPLE_CHOICE' | 'TEXT_INPUT'
  options: { text: string; isCorrect: boolean }[]
}

export default function VideoQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
  const [questions, setQuestions] = useState<NewQuestion[]>([])

  useEffect(() => {
    fetchVideo()
  }, [id])

  const fetchVideo = async () => {
    try {
      const res = await fetch(`/api/admin/videos/${id}`)
      if (!res.ok) throw new Error('Vídeo não encontrado')
      const data = await res.json()
      setVideo(data)
      
      // Load existing questions if any
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions.map((q: Question) => ({
          text: q.text,
          type: q.type,
          options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
        })))
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      setError('Erro ao carregar vídeo')
    } finally {
      setLoading(false)
    }
  }

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      type: 'MULTIPLE_CHOICE',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    }])
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, updates: Partial<NewQuestion>) => {
    setQuestions(questions.map((q, i) => i === index ? { ...q, ...updates } : q))
  }

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    setQuestions(questions.map((q, qi) => {
      if (qi !== qIndex) return q
      return {
        ...q,
        options: q.options.map((o, oi) => oi === oIndex ? { ...o, text } : o)
      }
    }))
  }

  const setCorrectOption = (qIndex: number, oIndex: number) => {
    setQuestions(questions.map((q, qi) => {
      if (qi !== qIndex) return q
      return {
        ...q,
        options: q.options.map((o, oi) => ({ ...o, isCorrect: oi === oIndex }))
      }
    }))
  }

  const handleSave = async (publish: boolean) => {
    setSaving(true)
    setError('')

    try {
      // Save questions and optionally publish
      const res = await fetch(`/api/admin/videos/${id}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          questions: questions.map((q, i) => ({ ...q, order: i })),
          publish
        })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar quiz')
        return
      }

      router.push('/admin/videos')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--accent)] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 text-center">
          <p className="text-red-400">Vídeo não encontrado</p>
          <Link href="/admin/videos" className="text-[var(--accent)] hover:underline mt-2 inline-block">
            Voltar para vídeos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/videos"
          className="text-[var(--foreground-muted)] hover:text-white flex items-center gap-2 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para vídeos
        </Link>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Criar Quiz</h1>
        <p className="text-[var(--foreground-muted)]">Passo 2 de 2: Perguntas para "{video.title}"</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-emerald-400 font-medium">Vídeo</span>
        </div>
        <div className="flex-1 h-0.5 bg-cyan-500"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">2</div>
          <span className="text-[var(--foreground)] font-medium">Quiz</span>
        </div>
      </div>

      {/* Video Preview Card */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4 mb-8 flex items-center gap-4">
        <div className="w-32 aspect-video bg-[var(--surface-elevated)] rounded-lg overflow-hidden flex-shrink-0">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-[var(--foreground)] font-semibold">{video.title}</h3>
          <p className="text-[var(--foreground-muted)] text-sm">Configurar perguntas para este vídeo</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {questions.length === 0 ? (
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-8 text-center">
            <svg className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-[var(--foreground)] font-semibold mb-2">Nenhuma pergunta ainda</h3>
            <p className="text-[var(--foreground-muted)] text-sm mb-4">Adicione perguntas para criar o quiz deste vídeo</p>
          </div>
        ) : (
          questions.map((question, qIndex) => (
            <div key={qIndex} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-[var(--accent)] font-medium">Pergunta {qIndex + 1}</span>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              {/* Question Text */}
              <input
                type="text"
                value={question.text}
                onChange={(e) => updateQuestion(qIndex, { text: e.target.value })}
                placeholder="Digite a pergunta..."
                className="w-full px-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] mb-4"
              />

              {/* Question Type Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => updateQuestion(qIndex, { type: 'MULTIPLE_CHOICE' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    question.type === 'MULTIPLE_CHOICE'
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/50'
                      : 'bg-[var(--surface-elevated)] text-[var(--foreground-muted)] border border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  Múltipla Escolha
                </button>
                <button
                  type="button"
                  onClick={() => updateQuestion(qIndex, { type: 'TEXT_INPUT' })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    question.type === 'TEXT_INPUT'
                      ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/50'
                      : 'bg-[var(--surface-elevated)] text-[var(--foreground-muted)] border border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  Resposta em Texto
                </button>
              </div>

              {/* Options (for multiple choice) */}
              {question.type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2">
                  <p className="text-xs text-[var(--foreground-muted)] mb-2">Clique no círculo para marcar a resposta correta</p>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCorrectOption(qIndex, oIndex)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          option.isCorrect
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-[var(--border-strong)] hover:border-[var(--border-strong)]500'
                        }`}
                      >
                        {option.isCorrect && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Opção ${oIndex + 1}`}
                        className="flex-1 px-3 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Text answer hint */}
              {question.type === 'TEXT_INPUT' && (
                <div className="bg-[var(--surface)] rounded-lg p-4 text-sm text-[var(--foreground-muted)]">
                  O usuário poderá responder em texto livre. Você poderá revisar as respostas manualmente.
                </div>
              )}
            </div>
          ))
        )}

        {/* Add Question Button */}
        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Adicionar Pergunta
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-6 py-3 bg-[var(--surface-elevated)] text-[var(--foreground)] font-medium rounded-lg hover:bg-[var(--border)] transition-all disabled:opacity-50"
        >
          Salvar como Rascunho
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Salvando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Publicar Vídeo
            </>
          )}
        </button>
      </div>
    </div>
  )
}
