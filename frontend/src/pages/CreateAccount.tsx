import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CreateAccount() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!username || !email || !password || !confirm) {
      setError('Please fill in all required fields')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await signup(username, email, password)
      navigate(returnUrl, { replace: true })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-black mb-2">Create Account</h1>
          <p className="text-sm text-[#666666]">Join our Contributors</p>
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
            <label className="block text-sm font-medium text-black mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="@gmail"
              className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white"
            />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234"
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

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Password Confirmation</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red text-white rounded-lg text-base font-semibold mt-6 mb-4 hover:brightness-110 transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register Now'}
          </button>
        </form>

        <p className="text-center text-sm text-[#666666]">
          Already have an account?{' '}
          <Link to={`/signin?returnUrl=${encodeURIComponent(returnUrl)}`} className="text-black font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
