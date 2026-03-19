'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, LockKeyhole } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Erro retornado pelo Supabase (credenciais inválidas, usuário não encontrado, etc.)
        console.error('[Login] Erro de autenticação do Supabase:', authError)
        setError('E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.')
        return
      }

      // Sucesso confirmado — só redireciona aqui
      router.refresh() // O Pulo do Gato: Força o Next.js a esquecer o cache e ler o novo cookie!
      router.push('/')
    } catch (unexpectedError) {
      // Erros silenciosos: timeout de rede, variável de ambiente ausente, exceção JS, etc.
      console.error('[Login] Erro inesperado durante o login:', unexpectedError)
      setError('Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.')
    } finally {
      // Garante que o spinner SEMPRE para, independentemente do que aconteceu acima
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-sm">
        {/* Ícone de cadeado acima do card */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <LockKeyhole className="h-8 w-8 text-primary" />
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Espaço Só Mente
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Acesso restrito
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Espaço Só Mente. Todos os direitos reservados.
        </p>
      </div>
    </main>
  )
}
