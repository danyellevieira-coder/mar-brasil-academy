'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    departmentCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])

  const validatePasswordLive = (password: string) => {
    const feedback: string[] = []
    if (password.length < 8) feedback.push('Mínimo 8 caracteres')
    if (!/[A-Z]/.test(password)) feedback.push('Uma letra maiúscula')
    if (!/[0-9]/.test(password)) feedback.push('Um número')
    setPasswordFeedback(feedback)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'password') {
      validatePasswordLive(value)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (passwordFeedback.length > 0) {
      setError('A senha não atende aos requisitos')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          departmentCode: formData.departmentCode || undefined
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta')
        return
      }

      router.push('/signin?registered=true')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 font-sans text-[#fafafa] py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/logo-dark.png"
              alt="Mar Brasil"
              className="h-24 mx-auto"
            />
          </Link>
          <p className="text-[#737373] mt-2">Criar nova conta</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#262626]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                Nome completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:border-[var(--accent)] transition-all"
                placeholder="Seu nome"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:border-[var(--accent)] transition-all"
                placeholder="seu@email.com"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                Senha
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:border-[var(--accent)] transition-all"
                placeholder="••••••••"
              />
              {formData.password && passwordFeedback.length > 0 && (
                <div className="mt-2 space-y-1">
                  {passwordFeedback.map((msg, i) => (
                    <p key={i} className="text-xs text-[var(--warning)] flex items-center gap-1">
                      <span>⚠</span> {msg}
                    </p>
                  ))}
                </div>
              )}
              {formData.password && passwordFeedback.length === 0 && (
                <p className="text-xs text-[var(--success)] mt-2 flex items-center gap-1">
                  <span>✓</span> Senha válida
                </p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                Confirmar senha
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:border-[var(--accent)] transition-all"
                placeholder="••••••••"
              />
            </div>

            {/* Código do Departamento */}
            <div>
              <label className="block text-sm font-medium text-[#a3a3a3] mb-2">
                Código da área <span className="text-[#404040]">(opcional)</span>
              </label>
              <input
                type="text"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#262626] rounded-lg text-white placeholder-[#404040] focus:outline-none focus:border-[var(--accent)] transition-all"
                placeholder="Deixe em branco se for cliente"
              />
              <p className="text-xs text-[#737373] mt-1">
                Funcionários: peça o código ao seu gestor
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-[var(--error)]/10 border border-[var(--error)]/50 rounded-lg p-3">
                <p className="text-[var(--error)] text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--accent)] text-white font-semibold rounded-lg hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[#1a1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Criando conta...
                </span>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#262626]"></div>
            <span className="text-[#737373] text-sm">ou</span>
            <div className="flex-1 h-px bg-[#262626]"></div>
          </div>

          {/* Guest Button */}
          <Link
            href="/"
            className="w-full py-3 bg-[#262626] border border-[#404040] text-white font-medium rounded-lg hover:bg-[#404040] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Entrar como Convidado
          </Link>

          {/* Link para login */}
          <p className="text-center text-[#737373] mt-6">
            Já tem conta?{' '}
            <Link href="/signin" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
