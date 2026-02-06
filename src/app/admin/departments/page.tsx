'use client'

import { useState, useEffect } from 'react'

interface Department {
  id: string
  name: string
  code: string
  _count: {
    users: number
    videoAccess: number
  }
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [formData, setFormData] = useState({ name: '', code: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/admin/departments')
      const data = await res.json()
      setDepartments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const openNewForm = () => {
    setEditingDept(null)
    setFormData({ name: '', code: '' })
    setError('')
    setShowForm(true)
  }

  const openEditForm = (dept: Department) => {
    setEditingDept(dept)
    setFormData({ name: dept.name, code: dept.code })
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const url = editingDept 
        ? `/api/admin/departments/${editingDept.id}`
        : '/api/admin/departments'
      
      const res = await fetch(url, {
        method: editingDept ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Erro ao salvar')
        return
      }

      setShowForm(false)
      fetchDepartments()
    } catch {
      setError('Erro de conexão')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (dept: Department) => {
    if (!confirm(`Excluir departamento "${dept.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/departments/${dept.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir')
        return
      }

      fetchDepartments()
    } catch {
      alert('Erro de conexão')
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Departamentos</h1>
          <p className="text-[var(--foreground-muted)]">Gerencie os departamentos da empresa</p>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={openNewForm}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Novo Departamento
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-[var(--surface-elevated)]">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--foreground-muted)]">Nome</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[var(--foreground-muted)]">Código</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-[var(--foreground-muted)]">Usuários</th>
              <th className="text-center px-6 py-4 text-sm font-medium text-[var(--foreground-muted)]">Vídeos</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-[var(--foreground-muted)]">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {departments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[var(--foreground-muted)]">
                  Nenhum departamento cadastrado
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-[var(--surface-elevated)]/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[var(--foreground)] font-medium">{dept.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="px-2 py-1 bg-[var(--surface-elevated)] rounded text-[var(--accent)] text-sm">{dept.code}</code>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[var(--foreground-secondary)]">{dept._count.users}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[var(--foreground-secondary)]">{dept._count.videoAccess}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditForm(dept)}
                        className="p-2 text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="p-2 text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                        disabled={dept._count.users > 0}
                        title={dept._count.users > 0 ? 'Remova os usuários primeiro' : 'Excluir'}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] w-full max-w-md">
            <div className="p-6 border-b border-[var(--border)]">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {editingDept ? 'Editar Departamento' : 'Novo Departamento'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="Ex: Recursos Humanos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">Código</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  required
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono"
                  placeholder="Ex: RH"
                />
                <p className="text-xs text-[var(--foreground-muted)] mt-1">Código usado no cadastro de usuários</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 bg-[var(--surface-elevated)] text-[var(--foreground)] font-medium rounded-lg hover:bg-[var(--border)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-semibold rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
