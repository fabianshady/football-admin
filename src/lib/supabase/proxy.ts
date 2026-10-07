import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()
    const publicRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/auth')
    const { data: admin, error: roleError } = user ? await supabase.rpc('is_admin') : { data: false, error: null }
    const authorized = Boolean(user && admin === true && !roleError)
    const redirectWithCookies = (url: URL) => {
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
        return response
    }

    if (
        !authorized && !publicRoute
    ) {
        // No user — redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.search = user ? '?error=' + encodeURIComponent('Se requiere una cuenta de administrador') : ''
        return redirectWithCookies(url)
    }

    // If user IS logged in and tries to go to /login, redirect to home
    if (authorized && request.nextUrl.pathname.startsWith('/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.search = ''
        return redirectWithCookies(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as-is.
    return supabaseResponse
}
