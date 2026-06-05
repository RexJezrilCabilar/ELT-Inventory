import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import type { Session } from '@supabase/supabase-js'
import SignIn from './pages/SignIn'
import Inventory from './pages/Inventory'

export default function App() {
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setLoading(false)
        })

        // Listen for auth changes (login/logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-black/40">Loading...</p>
        </div>
    )

    return session ? <Inventory /> : <SignIn />
}