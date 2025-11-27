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
import VendorDashboard from './pages/VendorDashboard'
import VendorProducts from './pages/VendorProducts'
import VendorOrders from './pages/VendorOrders'
import VendorManagement from './pages/VendorManagement'
import Vendors from './pages/Vendors'
import VendorStore from './pages/VendorStore'
import ProductSearch from './pages/ProductSearch'
import AdminSearch from './pages/AdminSearch'

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
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/vendor/:id" element={<VendorStore />} />
          <Route path="/products/search" element={<ProductSearch />} />
          <Route path="/admin/search" element={<AdminSearch />} />
          <Route path="/admin/vendors" element={<VendorManagement />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/orders/user/:userId" element={<Orders />} />
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor/products" element={<VendorProducts />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
