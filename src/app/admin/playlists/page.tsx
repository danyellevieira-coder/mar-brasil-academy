'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  thumbnail: string | null
}

interface PlaylistVideo {
  video: Video
  order: number
}

interface Playlist {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  isPublished: boolean
  createdAt: string
  videos: PlaylistVideo[]
  access: { department: { name: string; code: string } }[]
}

export default function AdminPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      const res = await fetch('/api/admin/playlists')
      const data = await res.json()
      setPlaylists(data)
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta playlist?')) return

    try {
      await fetch(`/api/admin/playlists/${id}`, { method: 'DELETE' })
      setPlaylists(playlists.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting playlist:', error)
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
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Playlists</h1>
          <p className="text-[var(--foreground-muted)]">Organize os vídeos em coleções temáticas</p>
        </div>
        <Link
          href="/admin/playlists/new"
          className="px-6 py-2 md:py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Playlist
        </Link>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-12 border border-[var(--border)] text-center">
          <div className="w-20 h-20 bg-[var(--surface-elevated)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Nenhuma playlist criada</h3>
          <p className="text-[var(--foreground-muted)] mb-6">Organize seus vídeos em coleções temáticas</p>
          <Link
            href="/admin/playlists/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)]/10 text-[var(--accent)] font-semibold rounded-lg border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Criar Playlist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-[var(--surface)] backdrop-blur-sm rounded-xl border border-[var(--border)] overflow-hidden group hover:border-[var(--border-strong)] transition-all"
            >
              {/* Thumbnail Stack */}
              <div className="relative aspect-video bg-[var(--surface-elevated)]">
                {playlist.videos.length > 0 && playlist.videos[0].video.thumbnail ? (
                  <img
                    src={playlist.videos[0].video.thumbnail}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                )}
                {/* Video Count Badge */}
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                  {playlist.videos.length} vídeo{playlist.videos.length !== 1 && 's'}
                </div>
                {/* Badges Container */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                  {/* Status Badge */}
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
                    playlist.isPublished 
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/30' 
                      : 'bg-amber-500/30 text-amber-300 border border-amber-400/30'
                  }`}>
                    {playlist.isPublished ? 'Publicada' : 'Rascunho'}
                  </div>
                  
                  {/* Department Badge with tooltip */}
                  <div 
                    className="relative group/badge"
                    title={playlist.access && playlist.access.length > 0 
                      ? playlist.access.map(a => a.department.name).join(', ')
                      : 'Acesso público'}
                  >
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md cursor-default ${
                      playlist.access && playlist.access.length > 0
                        ? 'bg-[var(--accent)]/30 text-white border border-[var(--accent)]/40'
                        : 'bg-[var(--foreground)]/10 text-[var(--foreground)] border border-[var(--foreground)]/20'
                    }`}>
                      {playlist.access && playlist.access.length > 0 
                        ? (playlist.access.length === 1 
                            ? playlist.access[0].department.name
                            : `${playlist.access[0].department.name} +${playlist.access.length - 1}`)
                        : 'Público'}
                    </div>
                    {/* Tooltip */}
                    {playlist.access && playlist.access.length > 1 && (
                      <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-black/90 backdrop-blur-md rounded-lg text-xs text-white opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-white/10">
                        {playlist.access.map(a => a.department.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-[var(--foreground)] font-semibold mb-2 line-clamp-1">{playlist.title}</h3>
                {playlist.description && (
                  <p className="text-[var(--foreground-muted)] text-sm line-clamp-2 mb-3">{playlist.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <Link
                    href={`/admin/playlists/${playlist.id}/edit`}
                    className="text-sm font-medium text-[var(--accent)] hover:opacity-80 transition-colors"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(playlist.id)}
                    className="p-2 text-[var(--foreground-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
