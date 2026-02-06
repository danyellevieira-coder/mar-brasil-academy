'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeVideos: 0,
    totalPlaylists: 0,
    totalUsers: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (res.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Dashboard</h1>
        <p className="text-[var(--foreground-muted)]">Bem-vindo ao painel administrativo da Mar Brasil Academy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Videos */}
        <div className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-gold)] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            {/* <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium">+12%</span> */}
          </div>
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            {loading ? '-' : stats.activeVideos}
          </h3>
          <p className="text-[var(--foreground-muted)] text-sm">Total de Vídeos</p>
        </div>

        {/* Total Playlists */}
        <div className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            {/* <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium">+5%</span> */}
          </div>
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            {loading ? '-' : stats.totalPlaylists}
          </h3>
          <p className="text-[var(--foreground-muted)] text-sm">Total de Playlists</p>
        </div>

        {/* Total Users */}
        <div className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            {/* <span className="text-emerald-500 dark:text-emerald-400 text-sm font-medium">+24%</span> */}
          </div>
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            {loading ? '-' : stats.totalUsers}
          </h3>
          <p className="text-[var(--foreground-muted)] text-sm">Total de Usuários</p>
        </div>

        {/* Completion Rate */}
        <div className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-[var(--foreground-muted)] text-sm font-medium">Em breve</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">
            {loading ? '-' : `${stats.completionRate}%`}
          </h3>
          <p className="text-[var(--foreground-muted)] text-sm">Taxa de Conclusão</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* View Videos */}
          <Link
            href="/admin/videos"
            className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-all">
                <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[var(--foreground)] font-semibold">Ver Vídeos</h3>
                <p className="text-[var(--foreground-muted)] text-sm">Gerenciar todos os vídeos</p>
              </div>
            </div>
          </Link>

          {/* New Video */}
          <Link
            href="/admin/videos/new"
            className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-all">
                <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-[var(--foreground)] font-semibold">Novo Vídeo</h3>
                <p className="text-[var(--foreground-muted)] text-sm">Adicionar vídeo do YouTube</p>
              </div>
            </div>
          </Link>

          {/* New Playlist */}
          <Link
            href="/admin/playlists/new"
            className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-all">
                <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-[var(--foreground)] font-semibold">Nova Playlist</h3>
                <p className="text-[var(--foreground-muted)] text-sm">Criar coleção de vídeos</p>
              </div>
            </div>
          </Link>

          {/* Departments */}
          <Link
            href="/admin/departments"
            className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-6 border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center group-hover:bg-[var(--accent)]/20 transition-all">
                <svg className="w-6 h-6 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-[var(--foreground)] font-semibold">Gerenciar Áreas</h3>
                <p className="text-[var(--foreground-muted)] text-sm">Configurar departamentos</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Atividade Recente</h2>
        <div className="bg-[var(--surface)] backdrop-blur-sm rounded-xl p-8 border border-[var(--border)] text-center">
          <div className="w-16 h-16 bg-[var(--surface-elevated)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[var(--foreground-muted)]">Nenhuma atividade recente</p>
          <p className="text-[var(--foreground-muted)] text-sm mt-1">A atividade dos usuários aparecerá aqui</p>
        </div>
      </div>
    </div>
  )
}
