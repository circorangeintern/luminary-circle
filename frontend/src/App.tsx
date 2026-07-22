import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RequireAuth from './components/RequireAuth'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Prices from './pages/Prices'
import About from './pages/About'
import Contact from './pages/Contact'
import SignIn from './pages/SignIn'
import CreateAccount from './pages/CreateAccount'
import SubmitPrice from './pages/SubmitPrice'
import PriceList from './pages/PriceList'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-bg-grey flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/prices" element={<Prices />} />
              <Route path="/prices/list" element={<PriceList />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/submit" element={<RequireAuth><SubmitPrice /></RequireAuth>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
