import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // Verifica a sessão real no servidor
    const { data: { session } } = await supabase.auth.getSession()

    const isPublicRoute = request.nextUrl.pathname === '/login'

    // Regra 1: Sem sessão e fora do login -> chuta pro login
    if (!session && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Regra 2: Com sessão e no login -> manda pro Dashboard
    if (session && isPublicRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        // Protege tudo, exceto arquivos de sistema e imagens
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}