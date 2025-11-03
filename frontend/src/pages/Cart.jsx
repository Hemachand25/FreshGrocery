import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import { formatINR } from '../utils/currency'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export default function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [msg, setMsg] = useState('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart')
      setCartItems(res.data)
      // Calculate total in INR (prices are stored in INR)
      const cartTotal = res.data.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      setTotal(cartTotal)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCartItems([])
      setTotal(0)
    }
  }

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    setLoading(true)
    try {
      await api.put(`/cart/${itemId}`, null, { params: { quantity: newQuantity } })
      await fetchCart() // Refresh cart to get updated data
    } catch (error) {
      setMsg('Error updating quantity')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const checkout = async () => {
    if (cartItems.length === 0) {
      setMsg('Your cart is empty')
      setTimeout(() => setMsg(''), 3000)
      return
    }

    setLoading(true)
    try {
      const order = await api.post('/cart/checkout')
      setMsg(`Order placed successfully! Order #${order.data.id}`)
      setCartItems([])
      setTotal(0)
      setTimeout(() => setMsg(''), 5000)
      window.dispatchEvent(new Event('cart-updated'))
    } catch (error) {
      setMsg('Error checking out')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (id) => {
    setLoading(true)
    try {
      await api.delete(`/cart/${id}`)
      await fetchCart()
    } catch (error) {
      setMsg('Error removing item')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 3 }}>Shopping Cart</Typography>
      {msg && (
        <Card sx={{ mb: 2, bgcolor: msg.includes('Error') ? '#FEE2E2' : '#E8F5E9' }}>
          <CardContent>
            <Typography color={msg.includes('Error') ? 'error' : 'success.main'}>{msg}</Typography>
          </CardContent>
        </Card>
      )}
      {cartItems.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">Your cart is empty.</Typography>
            <Typography color="text.secondary">Add some products to get started!</Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            {cartItems.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                  <Typography color="text.secondary">{formatINR(item.price)} each</Typography>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div>
                    <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={loading}><RemoveIcon /></IconButton>
                    <Typography component="span" sx={{ px: 1, fontWeight: 700 }}>{item.quantity}</Typography>
                    <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={loading}><AddIcon /></IconButton>
                  </div>
                  <Typography sx={{ color: 'secondary.main', fontWeight: 700 }}>{formatINR(item.price * item.quantity)}</Typography>
                  <Button color="error" onClick={() => removeItem(item.id)} disabled={loading}>Remove</Button>
                </div>
              </div>
            ))}
          </CardContent>
          <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
            <Typography variant="h6">Total: {formatINR(total)}</Typography>
            <Button variant="contained" color="primary" onClick={checkout} disabled={loading || cartItems.length === 0}>{loading ? 'Processing...' : 'Place Order'}</Button>
          </CardActions>
        </Card>
      )}
    </Container>
  )
}
