import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Usado em Server Components e Route Handlers
// Lê os cookies HTTP da requisição para recuperar a sessão no servidor.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll pode ser chamado de Server Components que não podem
            // setar cookies. Pode ser ignorado com segurança se o
            // Middleware estiver configurado corretamente para refresh.
          }
        },
      },
    }
  )
}
