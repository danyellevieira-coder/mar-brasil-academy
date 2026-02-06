'use client'

import { useState, useEffect, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserSelectorModal } from '@/components/admin/UserSelectorModal'

interface Department {
  id: string
  name: string
  code: string
}

interface User {
  id: string
  name: string
  email: string
}

interface VideoAccess {
  departmentId: string
}

interface VideoUserAccess {
  userId: string
}

interface Video {
  id: string
  title: string
  description: string | null
  youtubeUrl: string
  thumbnail: string | null
  isPublished: boolean
  requiresCompletion: boolean
  access: { department: { id: string } }[]
  assignedUsers?: { user: { id: string } }[] // Renamed from userAccess
}

export default function EditVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    thumbnail: '',
    customThumbnail: '' as string,
    departmentIds: [] as string[],
    userIds: [] as string[],
    isPublished: false,
    requiresCompletion: true
  })

  useEffect(() => {
    Promise.all([
      fetchDepartments(),
      fetchUsers(),
      fetchVideo()
    ])
  }, [id])

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchDepartments = async () => {
    setLoadingDepts(true)
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()
      setDepartments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    } finally {
      setLoadingDepts(false)
    }
  }

  const fetchVideo = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/videos/${id}`)
      if (!res.ok) {
        setError('Vídeo não encontrado')
        return
      }
      const video: Video = await res.json()
      setFormData({
        title: video.title,
        description: video.description || '',
        youtubeUrl: video.youtubeUrl,
        thumbnail: video.thumbnail || '',
        customThumbnail: '',
        departmentIds: video.access.map(a => a.department.id),
        userIds: (video.assignedUsers || []).map(a => a.user.id),
        isPublished: video.isPublished,
        requiresCompletion: video.requiresCompletion ?? true
      })
    } catch {
      setError('Erro ao carregar vídeo')
    } finally {
      setLoading(false)
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

  const handleUserToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId]
    }))
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, customThumbnail: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          youtubeUrl: formData.youtubeUrl,
          thumbnail: formData.customThumbnail || formData.thumbnail || getYoutubeThumbnail(formData.youtubeUrl),
          departmentIds: formData.departmentIds,
          userIds: formData.userIds,
          isPublished: formData.isPublished
        })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar vídeo')
        return
      }

      setSuccess('Vídeo atualizado com sucesso!')
      setTimeout(() => router.push('/admin/videos'), 1500)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const getYoutubeThumbnail = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    }
    return null
  }

  const thumbnailPreview = formData.customThumbnail || getYoutubeThumbnail(formData.youtubeUrl)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-10 w-10 border-4 border-[var(--accent)] border-t-transparent rounded-full"></div>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Editar Vídeo</h1>
            <p className="text-[var(--foreground-muted)]">Atualize as informações do vídeo</p>
          </div>
          <Link
            href={`/admin/videos/${id}/quiz`}
            className="px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Editar Quiz
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Published Status */}
        <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] gap-4">
          <div>
            <p className="font-medium text-[var(--foreground)]">Status de Publicação</p>
            <p className="text-sm text-[var(--foreground-muted)]">Vídeos publicados ficam visíveis para usuários</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
            className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
              formData.isPublished ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
              formData.isPublished ? 'left-8' : 'left-1'
            }`} />
          </button>
        </div>

        {/* Requires Completion Toggle */}
        <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] gap-4">
          <div>
            <p className="font-medium text-[var(--foreground)]">Requer Conclusão</p>
            <p className="text-sm text-[var(--foreground-muted)]">Se ativado, usuários precisam marcar o vídeo como concluído</p>
          </div>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, requiresCompletion: !prev.requiresCompletion }))}
            className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 ${
              formData.requiresCompletion ? 'bg-cyan-500' : 'bg-slate-600'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${
              formData.requiresCompletion ? 'left-8' : 'left-1'
            }`} />
          </button>
        </div>

        {/* YouTube URL with Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
              URL do YouTube *
            </label>
            <input
              type="text"
              value={formData.youtubeUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
              required
              className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-[var(--foreground-muted)] mt-1">Cole o link do vídeo não listado do YouTube</p>
          </div>

          {/* Thumbnail Preview with Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--foreground-secondary)]">
              Thumbnail
            </label>
            <div 
              className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-[var(--border)] relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {thumbnailPreview ? (
                <>
                  <img
                    src={thumbnailPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-white text-sm">Clique para trocar imagem</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center hover:bg-[var(--surface)] transition-colors">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-[var(--foreground-muted)] text-sm">Clique para adicionar thumbnail</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

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
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
            placeholder="Ex: Introdução às Boas Práticas de Segurança"
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
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all resize-none"
            placeholder="Descrição do conteúdo do vídeo..."
          />
        </div>

        {/* Department Access */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
            Visibilidade por Departamento
          </label>
          <p className="text-xs text-[var(--foreground-muted)] mb-4">
            Selecione quais departamentos terão acesso a este vídeo.
          </p>
          
          {loadingDepts ? (
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] py-4">
              <div className="animate-spin h-5 w-5 border-2 border-[var(--accent)] border-t-transparent rounded-full"></div>
              <span>Carregando departamentos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() => handleDepartmentToggle(dept.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    formData.departmentIds.includes(dept.id)
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50 text-[var(--accent)]'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.name}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
                      formData.departmentIds.includes(dept.id)
                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                        : 'border-[var(--border-strong)]'
                    }`}>
                      {formData.departmentIds.includes(dept.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[var(--foreground-muted)]">{dept.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Specific Access */}
        <div>
          <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-3">
            Acesso Especial para Usuários
          </label>
          <p className="text-xs text-[var(--foreground-muted)] mb-4">
            Além dos departamentos, você pode liberar este vídeo para usuários específicos.
          </p>
          
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all group"
            >
              <svg className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-[var(--accent)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar e Selecionar Usuários
            </button>
            {formData.userIds.length > 0 && (
              <span className="text-sm text-[var(--accent)]">
                {formData.userIds.length} usuário(s) com acesso
              </span>
            )}
          </div>
          
          {loadingUsers ? (
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] py-4">
              <div className="animate-spin h-5 w-5 border-2 border-[var(--accent)] border-t-transparent rounded-full"></div>
              <span>Carregando usuários...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
              <p className="text-[var(--foreground-muted)] text-sm font-light italic">
                Nenhum usuário cadastrado além de você.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleUserToggle(user.id)}
                  className={`p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                    formData.userIds.includes(user.id)
                      ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50 text-[var(--accent)]'
                      : 'bg-[var(--surface)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all flex-shrink-0 ${
                    formData.userIds.includes(user.id)
                      ? 'bg-[var(--accent)] border-blue-500'
                      : 'border-[var(--border-strong)]'
                  }`}>
                    {formData.userIds.includes(user.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    <p className="text-[10px] text-[var(--foreground-muted)] truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Success */}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-4">
            <p className="text-emerald-400 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
          <Link
            href="/admin/videos"
            className="px-6 py-3 text-[var(--foreground-muted)] hover:text-white transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2 md:py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
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
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>

      <UserSelectorModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onConfirm={(selectedIds) => setFormData(prev => ({ ...prev, userIds: selectedIds }))}
        users={users}
        initialSelectedIds={formData.userIds}
      />
    </div>
  )
}
