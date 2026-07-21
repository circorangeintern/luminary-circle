import { Link } from 'react-router-dom'

export default function CreateAccount() {
  return (
    <main className="px-6 sm:px-12 lg:px-20 py-16 flex justify-center">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold text-black mb-2">Create Account</h1>
          <p className="text-sm text-[#666666]">Join our Contributors</p>
        </div>

        <form>
          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Username</label>
            <input type="text" placeholder="Sanny opabo" className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Email</label>
            <input type="email" placeholder="@gmail" className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
            <input type="tel" placeholder="+234" className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white" />
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white" />
            <ul className="mt-3 list-none">
              <li className="text-xs text-[#666666] mb-1.5 flex items-start">
                <span className="mr-2">•</span>
                Your password must contain at least 8 characters.
              </li>
              <li className="text-xs text-[#666666] flex items-start">
                <span className="mr-2">•</span>
                Your password must contain an Alphabet and symbol
              </li>
            </ul>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-black mb-2">Password Confirmation</label>
            <input type="password" placeholder="••••••••" className="w-full px-3.5 py-3 border border-[#e0e0e0] rounded-md text-sm text-black bg-[#f5f5f5] placeholder-[#999999] focus:outline-none focus:border-[#d0d0d0] focus:bg-white" />
          </div>

          <button type="submit" className="w-full py-3.5 bg-red text-white rounded-lg text-base font-semibold mt-6 mb-4 hover:brightness-110 transition cursor-pointer">
            Register Now
          </button>
        </form>

        <p className="text-center text-sm text-[#666666]">
          Already have an account? <Link to="/signin" className="text-black font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </main>
  )
}
