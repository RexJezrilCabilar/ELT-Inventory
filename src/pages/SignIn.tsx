import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSignIn() {
        setError('')
        setLoading(true)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-full max-w-sm px-6">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-xl font-medium">Sign in</h1>
                    <p className="text-sm text-black/40 mt-1">ELT Inventory System</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-black/50 block mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/40"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-black/50 block mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-black/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black/40"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}

                    <button
                        onClick={handleSignIn}
                        disabled={loading}
                        className="w-full bg-black text-white text-sm py-2.5 rounded-lg hover:bg-black/80 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </div>
        </div>
    )
}