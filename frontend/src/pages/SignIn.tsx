import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SignIn() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      await login(username, password)
      navigate(returnUrl, { replace: true })
    } catch {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-black mb-2">Market Compare</h1>
          <p className="text-sm text-[#666666]">Please enter your details</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-5 p-3.5 bg-[#fbd7d7] border border-[#e3a3a3] rounded-lg text-sm text-[#b40000] font-semibold text-center">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Sanny opabo"
              className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black text-white rounded-lg text-base font-semibold mb-4 hover:bg-[#1a1a1a] transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-[#666666]">
          Don't have an account?{' '}
          <Link to={`/create-account?returnUrl=${encodeURIComponent(returnUrl)}`} className="text-black font-semibold hover:underline">
            sign up for free
          </Link>
        </p>
      </div>
    </main>
  )
}
