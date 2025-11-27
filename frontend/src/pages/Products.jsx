import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { formatINR } from '../utils/currency'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState('all')
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [quantities, setQuantities] = useState({})
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState({})
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  useEffect(() => {
    const q = searchParams.get('q') || ''
    setSearchQuery(q)
    fetchProducts()
    fetchCategories()
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchQuery])

  const fetchProducts = async () => {
    try {
      let endpoint = '/products'
      if (searchQuery) {
        const res = await api.get('/products/search', { params: { q: searchQuery } })
        setProducts(res.data)
        return
      }
      if (selectedCategory !== 'all') {
        const res = await api.get(`/products/category/${selectedCategory}`)
        setProducts(res.data)
        return
      }
      const res = await api.get(endpoint)
      setProducts(res.data)
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories')
      setCategories(res.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // removed vendor list fetching; customers don't browse vendors directly

  const updateQuantity = (productId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }))
  }

  const addToCart = async (productId) => {
    if (!token) {
      setMsg('Please login to add items to cart')
      return
    }
    
    if (role !== 'ROLE_CUSTOMER') {
      setMsg('Only customers can add items to cart')
      return
    }

    const quantity = quantities[productId] || 1
    setLoading(prev => ({ ...prev, [productId]: true }))
    
    try {
      await api.post('/cart/add', null, { params: { productId: productId, qty: quantity } })
      setMsg(`Added ${quantity} item(s) to cart`)
      setTimeout(() => setMsg(''), 3000)
    } catch (error) {
      setMsg('Error adding to cart')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setLoading(prev => ({ ...prev, [productId]: false }))
    }
    // notify navbar to refresh badge
    window.dispatchEvent(new Event('cart-updated'))
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 3 }}>Shop Products</Typography>
      {msg && (
        <Card sx={{ mb: 2, bgcolor: msg.includes('Error') ? '#FEE2E2' : '#E8F5E9' }}>
          <CardContent>
            <Typography color={msg.includes('Error') ? 'error' : 'success.main'}>{msg}</Typography>
          </CardContent>
        </Card>
      )}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search Products"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name..."
            onKeyDown={(e)=>{ if(e.key==='Enter'){ setSearchParams(prev=>{ const n=new URLSearchParams(prev); if(searchQuery) n.set('q', searchQuery); else n.delete('q'); return n; }); } }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Filter by Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </TextField>
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        {products.map(p => (
          <Grid item xs={12} sm={6} md={4} key={p.id}>
            <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>{p.description}</Typography>
                {p.category && (
                  <Typography color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
                    Category: {p.category.name}
                  </Typography>
                )}
                {p.vendor && (
                  <Typography color="text.secondary" sx={{ fontSize: '0.875rem', mb: 1 }}>
                    Vendor: {p.vendor.fullName || p.vendor.email}
                  </Typography>
                )}
                <Typography sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>{formatINR(p.price)}</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>Stock: {p.stock}</Typography>
                {token && role === 'ROLE_CUSTOMER' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Typography variant="body2" color="text.secondary">Qty:</Typography>
                    <IconButton size="small" onClick={() => updateQuantity(p.id, (quantities[p.id] || 1) - 1)}><RemoveIcon /></IconButton>
                    <Typography sx={{ width: 24, textAlign: 'center' }}>{quantities[p.id] || 1}</Typography>
                    <IconButton size="small" onClick={() => updateQuantity(p.id, (quantities[p.id] || 1) + 1)}><AddIcon /></IconButton>
                  </div>
                )}
              </CardContent>
              <CardActions sx={{ mt: 'auto' }}>
                {role === 'ROLE_ADMIN' ? (
                  <Button fullWidth variant="contained" color="info" onClick={() => navigate(`/admin?edit=${p.id}`)}>Edit Product</Button>
                ) : (
                  <Button fullWidth variant="contained" color="secondary" disabled={!token || role !== 'ROLE_CUSTOMER' || loading[p.id]} onClick={() => addToCart(p.id)}>
                    {loading[p.id] ? 'Adding...' : !token ? 'Login to Add' : 'Add to Cart'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}
