import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApiError } from '../utils/errors'

type State = 'form' | 'validationError' | 'phoneExists' | 'networkError' | 'submitting' | 'success'

export default function CreateAccount() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnUrl = searchParams.get('returnUrl') || '/'

  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [state, setState] = useState<State>('form')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!displayName) errs.displayName = 'Name cannot be empty'
    if (!phone) errs.phone = 'Phone cannot be empty'
    if (!password || password.length < 8) errs.password = 'Your password must be at least 8 characters.'
    if (password !== confirm) errs.confirm = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit() {
    setState('form')
    setErrors({})
    if (!validate()) { setState('validationError'); return }
    setState('submitting')
    try {
      await signup(displayName, phone, password)
      setState('success')
    } catch (err) {
      const msg = getApiError(err)
      if (msg.includes('already exist') || msg.includes('phone')) {
        setErrors({ phone: 'Phone number already exist.' })
        setState('phoneExists')
      } else if (msg.includes('network') || msg.includes('connection') || msg.includes('unreachable')) {
        setErrors({ phone: 'Phone number already exist.' })
        setState('networkError')
      } else {
        setState('validationError')
      }
    }
  }

  if (state === 'submitting') {
    return (
      <main style={{ background: '#f2f0ea', minHeight: '100vh' }} className="flex items-center justify-center px-4">
        <div className="skeleton h-8 w-48 rounded-lg" />
      </main>
    )
  }

  if (state === 'success') {
    return (
      <main style={{ background: '#f2f0ea', minHeight: '100vh' }} className="flex items-center justify-center px-4">
        <div className="w-full max-w-[460px] text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: '#d5efce', border: '1px solid #2e7d32' }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <path d="M4 12.5l5.5 5.5L20 7" stroke="#1b5e20" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.3px', color: '#141414' }} className="mb-1.5">
            Account created, {displayName}
          </h2>
          <p style={{ fontSize: 18, color: '#141414' }} className="mb-6">
            You have successfully signed up, Welcome to MarketCompare.
          </p>
          <button
            onClick={() => navigate(returnUrl, { replace: true })}
            className="w-full border-none rounded-xl px-4 py-[18px] text-base font-bold cursor-pointer flex items-center justify-center gap-2"
            style={{ background: '#b30000', color: '#fff', fontFamily: 'inherit' }}
          >
            Back
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#f2f0ea', minHeight: '100vh' }} className="flex justify-center px-4">
      <div className="w-full" style={{ maxWidth: 460, paddingTop: 56, paddingBottom: 120 }}>
        {/* Logo */}
        <div className="flex justify-center items-center gap-3.5 mb-[34px]">
          <img src="/logo-icon.png" srcSet="/logo-icon@2x.png 2x" alt="Market Compare" style={{ width: 'auto', height: 72 }} />
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.05, color: '#141414' }} className="m-0">
              Market<br />Compare
            </h1>
            <p style={{ fontSize: 11, color: '#555' }} className="mt-0.5">Know before you go</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: '#e9e2d0', borderRadius: 14 }} className="flex gap-2 p-1.5 mb-[26px]">
          <Link to="/signin" className="flex-1 text-center py-3.5 rounded-[10px] font-bold text-[15px] no-underline" style={{ color: '#b7b0a0' }}>
            Log In
          </Link>
          <div className="flex-1 text-center py-3.5 rounded-[10px] font-bold text-[15px]" style={{ background: '#fff', color: '#141414', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
            Sign up
          </div>
        </div>

        {/* Banner */}
        {state === 'phoneExists' && (
          <div className="border rounded-[10px] px-[18px] py-4 flex items-center gap-2.5 text-sm font-semibold mb-[22px]" style={{ background: '#fdf6e1', borderColor: '#e9d27a', color: '#8a6d1d' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <circle cx="12" cy="12" r="10" stroke="#8a6d1d" strokeWidth="2" />
              <line x1="12" y1="7" x2="12" y2="13" stroke="#8a6d1d" strokeWidth="2" />
              <circle cx="12" cy="16.5" r="1" fill="#8a6d1d" />
            </svg>
            An account with this email already exist. Want to sign in instead?
          </div>
        )}
        {state === 'networkError' && (
          <div className="border rounded-[10px] px-[18px] py-4 flex items-center gap-2.5 text-sm font-semibold mb-[22px]" style={{ borderColor: '#e3e3e0', color: '#b9b9b5' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b9b9b5" strokeWidth="2" className="shrink-0">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
              <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <line x1="12" y1="20" x2="12.01" y2="20" />
            </svg>
            We couldn't create your account — server is unreachable. Your details are saved. Try again when you reconnect.
          </div>
        )}

        {/* Fields */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#141414' }}>Username</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Sanny opabo"
            className="w-full border-none rounded-[10px] px-4 py-4 text-[15px] outline-none"
            style={{ background: '#f5f5f3', color: '#141414', fontFamily: 'inherit' }}
          />
          {errors.displayName && (
            <div className="flex items-center gap-1.5 text-sm font-semibold mt-2" style={{ color: '#c62828' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <circle cx="12" cy="12" r="10" stroke="#c62828" strokeWidth="2"/>
                <line x1="12" y1="7" x2="12" y2="13" stroke="#c62828" strokeWidth="2"/>
                <circle cx="12" cy="16.5" r="1" fill="#c62828"/>
              </svg>
              {errors.displayName}
            </div>
          )}
        </div>
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#141414' }}>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234"
            className="w-full border-none rounded-[10px] px-4 py-4 text-[15px] outline-none"
            style={{ background: '#f5f5f3', color: '#141414', fontFamily: 'inherit' }}
          />
          {errors.phone && (
            <div className="flex items-center gap-1.5 text-sm font-semibold mt-2" style={{ color: '#c62828' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <circle cx="12" cy="12" r="10" stroke="#c62828" strokeWidth="2"/>
                <line x1="12" y1="7" x2="12" y2="13" stroke="#c62828" strokeWidth="2"/>
                <circle cx="12" cy="16.5" r="1" fill="#c62828"/>
              </svg>
              {errors.phone}
            </div>
          )}
        </div>
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#141414' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            className="w-full border-none rounded-[10px] px-4 py-4 text-[15px] outline-none"
            style={{ background: '#f5f5f3', color: '#141414', fontFamily: 'inherit' }}
          />
          {errors.password ? (
            <div className="flex items-center gap-1.5 text-sm font-semibold mt-2" style={{ color: '#c62828' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <circle cx="12" cy="12" r="10" stroke="#c62828" strokeWidth="2"/>
                <line x1="12" y1="7" x2="12" y2="13" stroke="#c62828" strokeWidth="2"/>
                <circle cx="12" cy="16.5" r="1" fill="#c62828"/>
              </svg>
              {errors.password}
            </div>
          ) : (
            <ul className="mt-2.5 pl-[18px] text-sm" style={{ color: '#8a8a86' }}>
              <li className="mb-1">Your password must contain at least 8 characters.</li>
              <li className="mb-1">Your password must contain an Alphabet and symbol</li>
            </ul>
          )}
        </div>
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2" style={{ color: '#141414' }}>Password Confirmation</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="********"
            className="w-full border-none rounded-[10px] px-4 py-4 text-[15px] outline-none"
            style={{ background: '#f5f5f3', color: '#141414', fontFamily: 'inherit' }}
          />
          {errors.confirm && (
            <div className="flex items-center gap-1.5 text-sm font-semibold mt-2" style={{ color: '#c62828' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                <circle cx="12" cy="12" r="10" stroke="#c62828" strokeWidth="2"/>
                <line x1="12" y1="7" x2="12" y2="13" stroke="#c62828" strokeWidth="2"/>
                <circle cx="12" cy="16.5" r="1" fill="#c62828"/>
              </svg>
              {errors.confirm}
            </div>
          )}
        </div>

        {/* Button */}
        {state === 'networkError' ? (
          <button
            className="w-full border-none rounded-xl px-4 py-[18px] text-base font-bold flex items-center justify-center gap-2 mt-[26px]"
            style={{ background: '#a3a3a1', color: '#fff', fontFamily: 'inherit', cursor: 'default' }}
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Retry sign in
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full border-none rounded-xl px-4 py-[18px] text-base font-bold cursor-pointer flex items-center justify-center gap-2 mt-[26px]"
            style={{ background: '#b30000', color: '#fff', fontFamily: 'inherit' }}
          >
            Register Now
          </button>
        )}

        <div className="text-center text-sm mt-4" style={{ color: '#141414' }}>
          Already have an account?{' '}
          <Link to="/signin" className="underline" style={{ color: '#141414' }}>Log in</Link>
        </div>
      </div>
    </main>
  )
}