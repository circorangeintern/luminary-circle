import { Link } from 'react-router-dom'

export default function SignIn() {
  return (
    <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-black mb-2">Market Compare</h1>
          <p className="text-sm text-[#666666]">Please enter your details</p>
        </div>

        <button className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-[#e0e0e0] rounded-lg bg-white text-base font-medium text-black mb-6 hover:bg-gray-50 transition cursor-pointer">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#e0e0e0]" />
          <span className="text-xs text-[#b0b0b0]">Or continue with</span>
          <div className="flex-1 h-px bg-[#e0e0e0]" />
        </div>

        <form>
          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Username</label>
            <input type="text" placeholder="Sanny opabo" className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white" />
          </div>

          <div className="flex items-center justify-between mb-6 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-black">
              <input type="checkbox" className="w-[18px] h-[18px] cursor-pointer" />
              Remember me
            </label>
            <a href="#" className="text-black font-medium hover:underline">Forgot password?</a>
          </div>

          <button type="submit" className="w-full py-3.5 bg-black text-white rounded-lg text-base font-semibold mb-4 hover:bg-[#1a1a1a] transition cursor-pointer">
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-[#666666]">
          Don't have an account? <Link to="/create-account" className="text-black font-semibold hover:underline">sign up for free</Link>
        </p>
      </div>
    </main>
  )
}
