import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Admin from './pages/Admin'
import Landing from './pages/Landing'
import UserManagement from './pages/UserManagement'
import UserProfile from './pages/UserProfile'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="p-0 flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/products" element={<Products />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders/user/:userId" element={<Orders />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
