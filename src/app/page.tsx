'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Navbar } from '@/components/Navbar'

interface Video {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  hasQuiz?: boolean
  questions?: { id: string }[]
  userProgress?: {
    watchedFully: boolean
    quizCompleted: boolean
    quizScore: number
  } | null
}

interface Playlist {
  id: string
  title: string
  description: string | null
  thumbnail: string | null
  videos: Video[]
  access: { name: string; code: string }[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
  isSuperUser: boolean
}

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Fetch user and playlists in parallel
      const [resUser, resPlaylists] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/playlists')
      ])

      if (resUser.ok) {
        const userData = await resUser.json()
        setUser(userData.user)
      }

      if (resPlaylists.ok) {
        const playlistData = await resPlaylists.json()
        setPlaylists(Array.isArray(playlistData) ? playlistData : [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
      window.location.reload()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }


  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar user={user} onLogout={handleLogout} />

      {/* Hero Section */}

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <section className="mb-16">
          <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] p-12 md:p-20 shadow-2xl">
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: 'url(/thumbnails/ar-condicionado.png)' }}
            />
            {/* Dark Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">
                Seu Futuro Começa <span className="text-[var(--accent)]">Aqui.</span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed">
                Plataforma oficial de treinamentos da Mar Brasil. Conteúdo exclusivo para evolução contínua da nossa equipe.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-gold)] text-white font-bold rounded-xl hover:brightness-110 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Começar agora
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Playlists Section */}
        {playlists.length > 0 && playlists.map((playlist) => (
          <section key={playlist.id} className="mb-12">
            <div className="flex flex-col gap-2 mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-black tracking-tight">{playlist.title}</h2>
                <div className="h-px flex-1 bg-[var(--border)] opacity-50"></div>
              </div>
              
              <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden mask-linear-fade">
                { playlist.access && playlist.access.length > 0 ? (
                  playlist.access.map(a => (
                    <span 
                      key={a.code} 
                      className="flex-none px-3 py-1 bg-[var(--accent)]/10 backdrop-blur-md border border-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm whitespace-nowrap"
                    >
                      {a.name}
                    </span>
                  ))
                ) : (
                  <span className="flex-none px-3 py-1 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded-full uppercase tracking-widest shadow-sm whitespace-nowrap">
                    Público
                  </span>
                )}
                <span className="text-[var(--foreground-muted)] text-xs font-medium px-2 flex-none">—</span>
                <span className="text-[var(--foreground-muted)] text-xs font-medium flex-none">
                  {playlist.videos.length} vídeo{playlist.videos.length !== 1 && 's'}
                </span>
              </div>
              
              {playlist.description && (
                <p className="text-[var(--foreground-muted)] text-sm max-w-3xl leading-relaxed mt-1">
                  {playlist.description}
                </p>
              )}
            </div>
            <div className="flex overflow-x-auto pb-6 -mx-6 px-6 gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x">
              {playlist.videos.map((video) => (
                <Link
                  key={video.id}
                  href={`/watch/${video.id}`}
                  className="group flex-none w-[280px] md:w-auto bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden hover:border-[var(--accent)]/50 transition-all hover:scale-[1.03] shadow-lg hover:shadow-[var(--accent)]/10 snap-center"
                >
                  <div className="aspect-video bg-[var(--surface-elevated)] relative overflow-hidden">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--surface)]">
                        <svg className="w-12 h-12 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </div>
                    )}
                    {video.hasQuiz && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-[var(--accent)] rounded-lg text-[10px] font-bold text-white z-10">
                        QUIZ
                      </div>
                    )}
                    {video.userProgress?.quizCompleted && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-500">
                        <div className="bg-emerald-500 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-transform">
                          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                        <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                      {video.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {/* Empty State */}
        {!loading && playlists.length === 0 && (
          <section>
            <div className="bg-[var(--surface)]/40 rounded-2xl border border-[var(--border)] p-16 text-center">
              <div className="w-20 h-20 bg-[var(--surface-elevated)] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhum treinamento disponível</h3>
              <p className="text-[var(--foreground-muted)]">Aguarde a publicação de novos conteúdos em breve.</p>
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-video bg-slate-900 animate-pulse rounded-xl border border-slate-800"></div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <p className="text-[var(--foreground-muted)] text-sm font-medium">
              © {new Date().getFullYear()} Mar Brasil Academy. Todos os direitos reservados.
            </p>
            {!user && (
              <div className="flex gap-6 text-[var(--foreground-secondary)] text-sm font-medium">
                <Link href="/signin" className="hover:text-[var(--accent)] transition-colors">Entrar</Link>
                <Link href="/signup" className="hover:text-[var(--accent)] transition-colors">Criar Conta</Link>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[var(--foreground-muted)] text-sm">
            <a href="https://marbr.com.br/sobre-a-mar-brasil" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">Sobre Nós</a>
            <a href="https://chamados.marbr.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">Central do Cliente</a>
            <a href="https://marbr.com.br/politicas-de-privacidade-e-lgpd/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">Política de Privacidade</a>
            <a href="https://carreira.inhire.com.br/carreiras/marbrasil" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">Trabalhe Conosco</a>
            <a href="mailto:comercial@marbr.com.br" className="hover:text-[var(--accent)] transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
