import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function CreateAccount() {
  const { signup, phoneExists } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'

  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [pwTouched, setPwTouched] = useState(false)
  const pwShort = pwTouched && password.length > 0 && password.length < 8

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!displayName || !phone || !password) {
      setError('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      setPwTouched(true)
      return
    }

    if (phoneExists(phone)) {
      setError('An account with this phone number already exists.')
      return
    }

    setLoading(true)
    try {
      await signup(displayName, phone, password)
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
              {error === 'An account with this phone number already exists.' && (
                <span className="block mt-1 font-normal">
                  <Link to={`/signin?returnUrl=${encodeURIComponent(returnUrl)}`} className="text-[#b40000] underline font-semibold">
                    Log in instead
                  </Link>
                </span>
              )}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Sanny opabo"
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
              onChange={(e) => { setPassword(e.target.value); if (!pwTouched) setPwTouched(true) }}
              placeholder="••••••••"
              className={`w-full px-3.5 py-3 border rounded-md text-sm bg-[#f5f5f5] placeholder-[#999999] focus:outline-none text-black ${
                pwShort ? 'border-[#b40000] bg-[#fbd7d7]' : 'border-[#e0e0e0] focus:border-[#d0d0d0] focus:bg-white'
              }`}
            />
            {pwShort && (
              <div className="flex items-center gap-2 mt-2.5">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-[#b40000]">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
                </svg>
                <span className="text-sm font-semibold text-[#b40000]">Password must be at least 8 characters</span>
              </div>
            )}
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
