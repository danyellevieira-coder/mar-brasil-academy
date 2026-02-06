'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface UserSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedIds: string[]) => void
  users: User[]
  initialSelectedIds: string[]
}

export function UserSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  users,
  initialSelectedIds
}: UserSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isClosing, setIsClosing] = useState(false)

  // Initialize selected IDs when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds(initialSelectedIds)
      setSearchTerm('')
      setIsClosing(false)
    }
  }, [isOpen, initialSelectedIds])

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (userId: string) => {
    setSelectedIds(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(onClose, 300) // Wait for animation
  }

  const handleConfirm = () => {
    onConfirm(selectedIds)
    handleClose()
  }

  if (!isOpen && !isClosing) return null

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
      isOpen && !isClosing ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Backdrop with Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className={`relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] transition-all duration-300 transform ${
        isOpen && !isClosing ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-[var(--foreground)]">Selecionar Usuários</h3>
            <button 
              onClick={handleClose}
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 pr-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-[var(--foreground-muted)]">
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map(user => {
                const isSelected = selectedIds.includes(user.id)
                return (
                  <button
                    key={user.id}
                    onClick={() => handleToggle(user.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[var(--accent)]/10 border-[var(--accent)]/50'
                        : 'bg-[var(--surface-elevated)] border-transparent hover:border-[var(--border-strong)]'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[var(--accent)] border-[var(--accent)]'
                        : 'border-[var(--border-strong)]'
                    }`}>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className={`font-medium truncate ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--foreground)]'}`}>
                        {user.name}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] truncate">{user.email}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)] rounded-b-2xl flex flex-col-reverse md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[var(--foreground-muted)] w-full md:w-auto text-center md:text-left">
            <span className="text-[var(--accent)] font-bold">{selectedIds.length}</span> selecionados
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleClose}
              className="flex-1 md:flex-none px-4 py-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 md:flex-none px-6 py-2 bg-[var(--accent)] text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-[var(--accent)]/20 whitespace-nowrap"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
