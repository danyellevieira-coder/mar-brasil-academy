'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  thumbnail: string | null
  isPublished: boolean
}

interface Department {
  id: string
  name: string
  code: string
}

export default function NewPlaylistPage() {
  const router = useRouter()
  const [videos, setVideos] = useState<Video[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublished: false,
    videoIds: [] as string[],
    departmentIds: [] as string[]
  })

  useEffect(() => {
    fetchVideos()
    fetchDepartments()
  }, [])

  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos')
      const data = await res.json()
      setVideos(data.filter((v: Video) => v.isPublished))
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()
      setDepartments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const handleDepartmentToggle = (deptId: string) => {
    setFormData(prev => ({
      ...prev,
      departmentIds: prev.departmentIds.includes(deptId)
        ? prev.departmentIds.filter(id => id !== deptId)
        : [...prev.departmentIds, deptId]
    }))
  }

  const handleVideoToggle = (videoId: string) => {
    setFormData(prev => ({
      ...prev,
      videoIds: prev.videoIds.includes(videoId)
        ? prev.videoIds.filter(id => id !== videoId)
        : [...prev.videoIds, videoId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao criar playlist')
        return
      }

      router.push('/admin/playlists')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/playlists"
          className="text-[var(--foreground-muted)] hover:text-white flex items-center gap-2 mb-4 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para playlists
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Nova Playlist</h1>
        <p className="text-[var(--foreground-muted)]">Crie uma coleção de vídeos organizada</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            Título *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-white placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
            placeholder="Ex: Treinamento de Segurança"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-white placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all resize-none"
            placeholder="Descrição da playlist..."
          />
        </div>

        {/* Video Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
            Vídeos da Playlist
          </label>
          <p className="text-xs text-[var(--foreground-muted)] mb-4">
            Selecione os vídeos que farão parte desta playlist. A ordem será a mesma da seleção.
          </p>
          
          {videos.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--border)] text-center">
              <p className="text-[var(--foreground-muted)]">Nenhum vídeo publicado disponível</p>
              <Link href="/admin/videos/new" className="text-[var(--accent)] text-sm hover:underline">
                Criar um vídeo primeiro
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {videos.map((video, index) => {
                const isSelected = formData.videoIds.includes(video.id)
                const selectedIndex = formData.videoIds.indexOf(video.id)
                
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => handleVideoToggle(video.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50'
                        : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {/* Order Number */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isSelected
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--surface-elevated)] text-[var(--foreground-muted)]'
                    }`}>
                      {isSelected ? selectedIndex + 1 : index + 1}
                    </div>
                    
                    {/* Thumbnail */}
                    <div className="w-16 h-10 bg-[var(--surface-elevated)] rounded overflow-hidden flex-shrink-0">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Title */}
                    <span className={`flex-1 text-sm line-clamp-1 ${
                      isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground-secondary)]'
                    }`}>
                      {video.title}
                    </span>
                    
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      isSelected
                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                        : 'border-[var(--border-strong)]'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          
          {formData.videoIds.length > 0 && (
            <p className="mt-3 text-sm text-[var(--accent)]">
              {formData.videoIds.length} vídeo{formData.videoIds.length !== 1 && 's'} selecionado{formData.videoIds.length !== 1 && 's'}
            </p>
          )}
        </div>

        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
            Restringir a departamentos específicos?
          </label>
          <p className="text-xs text-[var(--foreground-muted)] mb-4">
            Se nenhum departamento for selecionado, a playlist será pública (todos podem ver).
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {departments.filter(d => d.code !== 'PUBLICO').map((dept) => {
              const isSelected = formData.departmentIds.includes(dept.id)
              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleDepartmentToggle(dept.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50'
                      : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--border-strong)]'
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground-secondary)]'
                    }`}>
                      {dept.name}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1 ml-6">{dept.code}</p>
                </button>
              )
            })}
          </div>
          
          {formData.departmentIds.length === 0 && (
            <p className="mt-3 text-sm text-emerald-400">
              ✓ Nenhum departamento selecionado = Playlist pública (todos podem ver)
            </p>
          )}
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <div>
            <h3 className="text-white font-medium">Publicar imediatamente</h3>
            <p className="text-sm text-[var(--foreground-muted)]">A playlist ficará visível para os usuários</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              formData.isPublished ? 'bg-purple-500' : 'bg-[var(--border)]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                formData.isPublished ? 'translate-x-7' : ''
              }`}
            />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Playlist'}
          </button>
          <Link
            href="/admin/playlists"
            className="px-8 py-3 bg-[var(--surface-elevated)] text-white font-semibold rounded-lg hover:bg-[var(--border)] transition-all"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
