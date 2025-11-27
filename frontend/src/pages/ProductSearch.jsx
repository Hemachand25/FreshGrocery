import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { formatINR } from '../utils/currency'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'

export default function ProductSearch() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState({})
  const [msg, setMsg] = useState('')
  const [loadingItems, setLoadingItems] = useState({})
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const q = searchParams.get('q') || ''

  useEffect(() => {
    if (q) {
      fetchProducts()
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [q])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await api.get('/products/search', { params: { q } })
      setProducts(res.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (productId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }))
  }

  const addToCart = async (productId) => {
    if (!token) {
      setMsg('Please login to add items to cart')
      setTimeout(() => setMsg(''), 3000)
      return
    }
    
    if (role !== 'ROLE_CUSTOMER') {
      setMsg('Only customers can add items to cart')
      setTimeout(() => setMsg(''), 3000)
      return
    }

    const quantity = quantities[productId] || 1
    setLoadingItems(prev => ({ ...prev, [productId]: true }))
    
    try {
      const res = await api.post('/cart/add', null, { params: { productId, qty: quantity } })
      setMsg(res.data || `Added ${quantity} item(s) to cart`)
      setTimeout(() => setMsg(''), 3000)
      window.dispatchEvent(new Event('cart-updated'))
    } catch (error) {
      const errorMsg = error.response?.data || error.message || 'Error adding to cart'
      setMsg(typeof errorMsg === 'string' ? errorMsg : 'Error adding to cart')
      setTimeout(() => setMsg(''), 3000)
    } finally {
      setLoadingItems(prev => ({ ...prev, [productId]: false }))
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Searching products...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 3 }}>
        Search Results {q && <span style={{ color: '#666', fontSize: '1rem' }}>for "{q}"</span>}
      </Typography>
      
      {msg && (
        <Card sx={{ mb: 2, bgcolor: msg.includes('Error') || msg.includes('another vendor') ? '#FEE2E2' : '#E8F5E9' }}>
          <CardContent>
            <Typography color={msg.includes('Error') || msg.includes('another vendor') ? 'error' : 'success.main'}>
              {msg}
            </Typography>
          </CardContent>
        </Card>
      )}

      {products.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No products found for "{q}".</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Try a different search term.</Typography>
          </CardContent>
        </Card>
      ) : (
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
                      Vendor: <Link to={`/vendor/${p.vendor.id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>
                        {p.vendor.fullName || p.vendor.email}
                      </Link>
                    </Typography>
                  )}
                  <Typography sx={{ color: 'secondary.main', fontWeight: 700, mb: 1 }}>{formatINR(p.price)}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>Stock: {p.stock}</Typography>
                  {token && role === 'ROLE_CUSTOMER' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Typography variant="body2" color="text.secondary">Qty:</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(p.id, (quantities[p.id] || 1) - 1)}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ width: 24, textAlign: 'center' }}>{quantities[p.id] || 1}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(p.id, (quantities[p.id] || 1) + 1)}>
                        <AddIcon />
                      </IconButton>
                    </div>
                  )}
                </CardContent>
                <CardActions sx={{ mt: 'auto' }}>
                  {token && role === 'ROLE_CUSTOMER' ? (
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="secondary" 
                      disabled={loadingItems[p.id]} 
                      onClick={() => addToCart(p.id)}
                    >
                      {loadingItems[p.id] ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  ) : !token ? (
                    <Button fullWidth variant="contained" color="secondary" onClick={() => window.location.href = '/login'}>
                      Login to Add
                    </Button>
                  ) : p.vendor && (
                    <Button fullWidth variant="outlined" color="primary" component={Link} to={`/vendor/${p.vendor.id}`}>
                      View Store
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}

