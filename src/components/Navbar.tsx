'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from 'next-themes'

interface User {
  id: string
  name: string
  email: string
  role: string
  isSuperUser: boolean
}

interface NavbarProps {
  user: User | null
  onLogout: () => void
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = resolvedTheme || theme

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-12 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            {mounted ? (
              <img
                src={currentTheme === 'dark' ? '/logo-dark.png' : '/logo-light.png'}
                alt="Mar Brasil Academy"
                className="h-full w-auto object-contain"
              />
            ) : (
              <div className="h-10 w-32 bg-[var(--surface-elevated)] animate-pulse rounded-lg" />
            )}
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4">
              {/* Admin link */}
              {(user.isSuperUser || user.role === 'ADMIN') && (
                <Link
                  href="/admin"
                  className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors font-medium"
                >
                  Admin
                </Link>
              )}

              {/* User profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
                <div className="w-9 h-9 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-gold)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--accent)]/20">
                  <span className="text-white font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium leading-tight">{user.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)] max-w-[150px] truncate">{user.email}</p>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors p-2 hover:bg-[var(--surface-elevated)] rounded-lg"
                title="Sair"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            /* Guest / Not Logged Desktop */
            <div className="flex items-center gap-4">
              <span className="text-[var(--foreground-muted)] text-sm font-medium px-3 py-1 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                Convidado
              </span>
              <Link href="/signin" className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors font-medium">
                Entrar
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] hover:brightness-110 text-white font-bold rounded-xl transition-all shadow-lg shadow-[var(--accent)]/20"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-[var(--foreground)] hover:bg-[var(--surface-elevated)] rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl animate-in slide-in-from-top-5 duration-200">
          <div className="p-4 space-y-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-[var(--surface-elevated)] rounded-xl border border-[var(--border)]">
                  <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-gold)] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{user.name}</p>
                    <p className="text-sm text-[var(--foreground-muted)] truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {(user.isSuperUser || user.role === 'ADMIN') && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors font-medium text-[var(--foreground)]"
                    >
                      <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Painel Administrativo
                    </Link>
                  )}

                  <button
                    onClick={onLogout}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-500 hover:text-red-600 transition-colors font-medium w-full text-left"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair da Conta
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="p-3 bg-[var(--surface-elevated)] rounded-xl text-center text-[var(--foreground-muted)] text-sm">
                  Você está navegando como convidado
                </div>
                <Link
                  href="/signin"
                  className="w-full py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl text-center font-bold hover:bg-[var(--border)] transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/signup"
                  className="w-full py-3 bg-[var(--accent)] text-white rounded-xl text-center font-bold hover:brightness-110 transition-colors"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
