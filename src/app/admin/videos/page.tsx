'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Department {
  id: string
  name: string
  code: string
}

interface VideoAccess {
  department: Department
}

interface Video {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  thumbnail: string | null
  isPublished: boolean
  createdAt: string
  access: VideoAccess[]
  _count: {
    progress: number
  }
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos')
      const data = await res.json()
      setVideos(data)
    } catch (error) {
      console.error('Error fetching videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return

    try {
      await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
      setVideos(videos.filter(v => v.id !== id))
    } catch (error) {
      console.error('Error deleting video:', error)
    }
  }

  const togglePublish = async (video: Video) => {
    try {
      await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...video, isPublished: !video.isPublished })
      })
      setVideos(videos.map(v => 
        v.id === video.id ? { ...v, isPublished: !v.isPublished } : v
      ))
    } catch (error) {
      console.error('Error toggling publish:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-[var(--accent)] border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Vídeos</h1>
          <p className="text-[var(--foreground-muted)]">Gerencie os vídeos de treinamento</p>
        </div>
        <Link
          href="/admin/videos/new"
          className="px-6 py-2 md:py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Vídeo
        </Link>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-12 border border-[var(--border)] text-center">
          <div className="w-20 h-20 bg-[var(--surface-elevated)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Nenhum vídeo cadastrado</h3>
          <p className="text-[var(--foreground-muted)] mb-6">Comece adicionando seu primeiro vídeo de treinamento</p>
          <Link
            href="/admin/videos/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)]/10 text-[var(--accent)] font-semibold rounded-lg border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Adicionar Vídeo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-[var(--surface)] backdrop-blur-sm rounded-xl border border-[var(--border)] overflow-hidden group hover:border-[var(--border-strong)] transition-all"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[var(--surface-elevated)]">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  video.isPublished 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {video.isPublished ? 'Publicado' : 'Rascunho'}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-[var(--foreground)] font-semibold mb-2 line-clamp-1">{video.title}</h3>
                
                {/* Department Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {video.access.length === 0 ? (
                    <span className="text-xs text-[var(--foreground-muted)]">Sem restrição de área</span>
                  ) : (
                    video.access.slice(0, 3).map((a) => (
                      <span
                        key={a.department.id}
                        className="px-2 py-0.5 bg-[var(--surface-elevated)] text-[var(--foreground-muted)] text-xs rounded"
                      >
                        {a.department.name}
                      </span>
                    ))
                  )}
                  {video.access.length > 3 && (
                    <span className="px-2 py-0.5 bg-[var(--surface-elevated)] text-[var(--foreground-muted)] text-xs rounded">
                      +{video.access.length - 3}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <button
                    onClick={() => togglePublish(video)}
                    className={`text-sm font-medium transition-colors ${
                      video.isPublished 
                        ? 'text-amber-400 hover:text-amber-300' 
                        : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    {video.isPublished ? 'Despublicar' : 'Publicar'}
                  </button>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/videos/${video.id}/edit`}
                      className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 text-[var(--foreground-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
