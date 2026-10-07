import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const requestedNext = searchParams.get('next') ?? '/'
    const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') && !requestedNext.includes('\\') ? requestedNext : '/'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            const { data: admin, error: roleError } = await supabase.rpc('is_admin')
            if (roleError || admin !== true) {
                await supabase.auth.signOut()
                return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Esta cuenta no tiene acceso de administrador')}`)
            }
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('No se pudo verificar tu sesión. Intenta de nuevo.')}`)
}
