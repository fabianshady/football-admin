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

    // Refresh/verify the session here; the server layout and every data reader/action
    // independently verify the live user and admin role via request-scoped requireAdmin.
    // getClaims uses JWKS for asymmetric keys, or the Auth server for legacy keys.
    const { data, error } = await supabase.auth.getClaims()
    const signedIn = !error && typeof data?.claims?.sub === 'string'
    const pathname = request.nextUrl.pathname
    const loginRoute = pathname === '/login' || pathname.startsWith('/login/')
    const publicRoute = loginRoute || pathname === '/auth' || pathname.startsWith('/auth/')
    const redirectWithCookies = (url: URL) => {
        const response = NextResponse.redirect(url)
        supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie))
        return response
    }

    if (
        !signedIn && !publicRoute
    ) {
        // No user — redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.search = ''
        return redirectWithCookies(url)
    }

    // If user IS logged in and tries to go to /login, redirect to home
    // Only the login redirect needs a role lookup here. Non-admin users stay on
    // login; protected routes are rejected by the layout/readers, not by trust in cookies.
    const role = signedIn && loginRoute ? await supabase.rpc('is_admin') : null
    if (role?.data === true && !role.error) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        url.search = ''
        return redirectWithCookies(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as-is.
    return supabaseResponse
}
