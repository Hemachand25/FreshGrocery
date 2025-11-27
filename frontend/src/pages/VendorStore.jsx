import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import { formatINR } from '../utils/currency'

export default function VendorStore() {
  const { id } = useParams()
  const [products, setProducts] = useState([])
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  useEffect(() => {
    const run = async () => {
      try {
        const [pRes, vRes] = await Promise.all([
          api.get(`/products/vendor/${id}`),
          api.get(`/users/all`).catch(()=>({ data: [] }))
        ])
        setProducts(pRes.data)
        const found = (vRes.data || []).find(u => u.id === parseInt(id))
        setVendor(found || null)
      } catch (e) {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [id])

  const addToCart = async (productId) => {
    if (!token) {
      setMsg('Please login to add items to cart')
      setTimeout(()=>setMsg(''), 3000)
      return
    }
    if (role !== 'ROLE_CUSTOMER') {
      setMsg('Only customers can add items to cart')
      setTimeout(()=>setMsg(''), 3000)
      return
    }
    try {
      const res = await api.post('/cart/add', null, { params: { productId, qty: 1 } })
      const msg = res.data || 'Added to cart'
      setMsg(msg)
      setTimeout(()=>setMsg(''), 3000)
      window.dispatchEvent(new Event('cart-updated'))
    } catch (e) {
      console.error('Error adding to cart:', e)
      const errorMsg = e.response?.data || e.message || 'Error adding to cart'
      setMsg(typeof errorMsg === 'string' ? errorMsg : 'Error adding to cart')
      setTimeout(()=>setMsg(''), 4000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 p-6">
        <div className="text-center text-gray-600">Loading store...</div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <h2 className="text-3xl font-extrabold mb-2 text-orange-700">{vendor?.fullName || vendor?.email || 'Vendor'} Store</h2>
      {msg && (
        <div className={`mb-6 p-3 rounded ${msg.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{msg}</div>
      )}
      {products.length === 0 ? (
        <div className="bg-white shadow rounded p-8 text-center text-gray-600">No products available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white shadow rounded p-4">
              <div className="text-lg font-semibold">{p.name}</div>
              <div className="text-gray-600 text-sm mb-2">{p.description}</div>
              <div className="text-gray-600 text-sm mb-2">{p.category ? `Category: ${p.category.name}` : ''}</div>
              <div className="text-orange-700 font-bold mb-2">{formatINR(p.price)}</div>
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded" onClick={()=>addToCart(p.id)}>Add to Cart</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


